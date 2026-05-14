/*
 * FinalArtwork.jsx
 *
 * Adobe Illustrator script that produces a "final artwork" set from the
 * currently open document:
 *
 *   1. <filename>_OL.ai      - copy of the file with all text converted to outlines
 *   2. <filename>_Hires.pdf  - high resolution press-quality PDF
 *   3. <filename>_LoRes.jpg  - low resolution JPEG of every artboard
 *
 * Installation:
 *   Copy this file to one of:
 *     macOS:   /Applications/Adobe Illustrator <version>/Presets/<locale>/Scripts/
 *     Windows: C:\Program Files\Adobe\Adobe Illustrator <version>\Presets\<locale>\Scripts\
 *   Then restart Illustrator. The script appears under File > Scripts > FinalArtwork.
 *
 *   Or run ad-hoc via File > Scripts > Other Script... and pick this file.
 */

#target illustrator

(function () {
    if (app.documents.length === 0) {
        alert("Open the working Illustrator file before running FinalArtwork.");
        return;
    }

    var sourceDoc = app.activeDocument;

    if (!sourceDoc.saved) {
        var proceed = confirm(
            "The current document has unsaved changes.\n\n" +
            "It is strongly recommended to save your working file first so the " +
            "exported artwork matches the master.\n\nContinue anyway?"
        );
        if (!proceed) return;
    }

    var sourcePath = sourceDoc.fullName;
    var sourceFolder = sourcePath.parent;
    var baseName = stripExtension(sourcePath.name);

    var outputFolder = new Folder(sourceFolder.fsName + "/" + baseName + "_FinalArtwork");
    if (!outputFolder.exists) outputFolder.create();

    var olFile     = new File(outputFolder.fsName + "/" + baseName + "_OL.ai");
    var hiresFile  = new File(outputFolder.fsName + "/" + baseName + "_Hires.pdf");
    var loresFile  = new File(outputFolder.fsName + "/" + baseName + "_LoRes.jpg");

    var errors = [];

    try {
        exportOutlinedAi(sourceDoc, olFile);
    } catch (e) {
        errors.push("Outlined AI failed: " + e);
    }

    try {
        exportHiresPdf(sourceDoc, hiresFile);
    } catch (e) {
        errors.push("Hi-res PDF failed: " + e);
    }

    try {
        exportLoresJpg(sourceDoc, loresFile);
    } catch (e) {
        errors.push("Lo-res JPG failed: " + e);
    }

    if (errors.length === 0) {
        alert(
            "Final artwork created:\n\n" +
            olFile.fsName + "\n" +
            hiresFile.fsName + "\n" +
            loresFile.fsName.replace(/\.jpg$/i, "") + "_<artboard>.jpg"
        );
    } else {
        alert("FinalArtwork finished with errors:\n\n" + errors.join("\n\n"));
    }

    // ---------------------------------------------------------------------

    function stripExtension(name) {
        var dot = name.lastIndexOf(".");
        return dot > 0 ? name.substring(0, dot) : name;
    }

    function exportOutlinedAi(doc, targetFile) {
        // Save As a copy first so we can mutate without touching the master.
        var aiOpts = new IllustratorSaveOptions();
        aiOpts.compatibility = Compatibility.ILLUSTRATOR17; // CC compatible
        aiOpts.pdfCompatible = true;
        aiOpts.embedICCProfile = true;
        aiOpts.saveMultipleArtboards = false;

        doc.saveAs(targetFile, aiOpts);

        // Illustrator switches the active document to the newly saved file.
        var workingDoc = app.activeDocument;

        unlockAndShowEverything(workingDoc);
        outlineAllText(workingDoc);

        workingDoc.saveAs(targetFile, aiOpts);
        workingDoc.close(SaveOptions.DONOTSAVECHANGES);

        // Re-open the original master so subsequent exports use it.
        app.open(doc.fullName);
    }

    function unlockAndShowEverything(doc) {
        for (var i = 0; i < doc.layers.length; i++) {
            unlockLayer(doc.layers[i]);
        }
    }

    function unlockLayer(layer) {
        layer.locked = false;
        layer.visible = true;
        for (var i = 0; i < layer.layers.length; i++) {
            unlockLayer(layer.layers[i]);
        }
        for (var j = 0; j < layer.pageItems.length; j++) {
            try { layer.pageItems[j].locked = false; } catch (e) {}
            try { layer.pageItems[j].hidden = false; } catch (e) {}
        }
    }

    function outlineAllText(doc) {
        // createOutline() mutates the collection while iterating, so walk
        // from the end. Also handle text inside groups by recursing.
        outlineTextInContainer(doc);
    }

    function outlineTextInContainer(container) {
        if (container.textFrames && container.textFrames.length) {
            for (var i = container.textFrames.length - 1; i >= 0; i--) {
                try { container.textFrames[i].createOutline(); } catch (e) {}
            }
        }
        if (container.groupItems && container.groupItems.length) {
            for (var g = 0; g < container.groupItems.length; g++) {
                outlineTextInContainer(container.groupItems[g]);
            }
        }
        if (container.layers && container.layers.length) {
            for (var l = 0; l < container.layers.length; l++) {
                outlineTextInContainer(container.layers[l]);
            }
        }
    }

    function exportHiresPdf(doc, targetFile) {
        var opts = new PDFSaveOptions();
        // "[High Quality Print]" preset is bundled with Illustrator.
        opts.pDFPreset = "[High Quality Print]";
        opts.compatibility = PDFCompatibility.ACROBAT5;
        opts.preserveEditability = false;
        opts.viewAfterSaving = false;
        opts.generateThumbnails = true;
        opts.optimization = true;
        opts.artboardRange = "";              // empty = all artboards
        opts.colorDownsamplingMethod = DownsampleMethod.BICUBICDOWNSAMPLE;
        opts.colorDownsampling = 300;
        opts.colorDownsamplingImageThreshold = 450;
        opts.grayscaleDownsamplingMethod = DownsampleMethod.BICUBICDOWNSAMPLE;
        opts.grayscaleDownsampling = 300;
        opts.grayscaleDownsamplingImageThreshold = 450;
        opts.monochromeDownsamplingMethod = DownsampleMethod.BICUBICDOWNSAMPLE;
        opts.monochromeDownsampling = 1200;
        opts.monochromeDownsamplingImageThreshold = 1800;

        doc.saveAs(targetFile, opts);
    }

    function exportLoresJpg(doc, targetFile) {
        var opts = new ExportOptionsJPEG();
        opts.qualitySetting = 60;             // ~medium quality, smaller file
        opts.antiAliasing = true;
        opts.optimization = true;
        opts.artBoardClipping = true;
        opts.horizontalScale = 50;            // 50% of source = lo-res
        opts.verticalScale = 50;

        var baseFsName = targetFile.fsName.replace(/\.jpg$/i, "");

        for (var i = 0; i < doc.artboards.length; i++) {
            doc.artboards.setActiveArtboardIndex(i);
            var abName = sanitize(doc.artboards[i].name);
            var perArtboard = new File(baseFsName + "_" + (i + 1) + "_" + abName + ".jpg");
            doc.exportFile(perArtboard, ExportType.JPEG, opts);
        }
    }

    function sanitize(name) {
        return String(name).replace(/[\\\/:*?"<>|]/g, "_");
    }
})();
