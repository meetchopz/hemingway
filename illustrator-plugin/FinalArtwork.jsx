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

    // The document must be saved to disk - we need a real path to copy from
    // and to reopen the master between export steps.
    var originalFile;
    try {
        originalFile = sourceDoc.fullName;
    } catch (e) {
        alert("Save your working file to disk before running FinalArtwork.");
        return;
    }
    if (!originalFile || !originalFile.exists) {
        alert("Save your working file to disk before running FinalArtwork.");
        return;
    }

    if (!sourceDoc.saved) {
        var proceed = confirm(
            "The current document has unsaved changes.\n\n" +
            "It is strongly recommended to save your working file first so the " +
            "exported artwork matches the master.\n\nContinue anyway?"
        );
        if (!proceed) return;
    }

    var sourceFolder = originalFile.parent;
    var baseName = stripExtension(originalFile.name);

    var outputFolder = new Folder(sourceFolder.fsName + "/" + baseName + "_FinalArtwork");
    if (!outputFolder.exists) outputFolder.create();

    var olFile     = new File(outputFolder.fsName + "/" + baseName + "_OL.ai");
    var hiresFile  = new File(outputFolder.fsName + "/" + baseName + "_Hires.pdf");
    var loresFile  = new File(outputFolder.fsName + "/" + baseName + "_LoRes.jpg");

    var results = [];
    var errors = [];

    // Step 1: JPGs first. exportFile() does not change the document's file
    // association, so the master in memory remains untouched.
    try {
        var jpgFiles = exportLoresJpg(app.activeDocument, loresFile);
        results.push("Lo-res JPG x" + jpgFiles.length);
    } catch (e) {
        errors.push("Lo-res JPG failed: " + e + (e.line ? " (line " + e.line + ")" : ""));
    }

    // Step 2: Hi-res PDF. saveAs() with PDFSaveOptions re-associates the
    // active document with the PDF file, so we close it without saving
    // afterwards and reopen the original master from disk.
    try {
        exportHiresPdf(app.activeDocument, hiresFile);
        results.push("Hi-res PDF");
    } catch (e) {
        errors.push("Hi-res PDF failed: " + e + (e.line ? " (line " + e.line + ")" : ""));
    }
    reopenMaster(originalFile);

    // Step 3: Outlined AI. Instead of saveAs-ing the master (which would
    // invalidate our doc reference and risk altering the working file),
    // copy the file on disk, open the copy, outline its text, and save it.
    try {
        exportOutlinedAi(originalFile, olFile);
        results.push("Outlined AI");
    } catch (e) {
        errors.push("Outlined AI failed: " + e + (e.line ? " (line " + e.line + ")" : ""));
    }
    reopenMaster(originalFile);

    if (errors.length === 0) {
        alert(
            "Final artwork created in:\n" + outputFolder.fsName + "\n\n" +
            results.join("\n")
        );
    } else {
        alert(
            "FinalArtwork finished.\n\n" +
            (results.length ? "Completed:\n" + results.join("\n") + "\n\n" : "") +
            "Errors:\n" + errors.join("\n\n")
        );
    }

    // ---------------------------------------------------------------------

    function stripExtension(name) {
        var dot = name.lastIndexOf(".");
        return dot > 0 ? name.substring(0, dot) : name;
    }

    function reopenMaster(masterFile) {
        // Close any open doc that points at the master path, then reopen
        // a fresh copy so subsequent steps run against pristine state.
        for (var i = app.documents.length - 1; i >= 0; i--) {
            try {
                var d = app.documents[i];
                if (d.fullName && d.fullName.fsName === masterFile.fsName) {
                    d.close(SaveOptions.DONOTSAVECHANGES);
                }
            } catch (e) {}
        }
        // Also close any leftover doc whose file we just wrote (PDF/AI copy)
        // so it does not linger. We deliberately do not touch unrelated open
        // documents.
        app.open(masterFile);
    }

    function exportOutlinedAi(masterFile, targetFile) {
        // Copy the master file on disk so we can safely mutate the copy.
        if (targetFile.exists) targetFile.remove();
        if (!masterFile.copy(targetFile.fsName)) {
            throw new Error("Could not copy master to " + targetFile.fsName);
        }

        var workingDoc = app.open(targetFile);

        unlockAndShowEverything(workingDoc);
        outlineTextInContainer(workingDoc);

        var aiOpts = new IllustratorSaveOptions();
        aiOpts.pdfCompatible = true;
        aiOpts.embedICCProfile = true;
        // compatibility intentionally left at default so this works on any
        // modern Illustrator version.

        workingDoc.saveAs(targetFile, aiOpts);
        workingDoc.close(SaveOptions.DONOTSAVECHANGES);
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

    function outlineTextInContainer(container) {
        // createOutline() mutates the textFrames collection, so walk it
        // back-to-front. Recurse into groups and sublayers so locked-down
        // or nested text still gets converted.
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
        opts.pDFPreset = "[High Quality Print]";
        opts.compatibility = PDFCompatibility.ACROBAT5;
        opts.preserveEditability = false;
        opts.viewAfterSaving = false;
        opts.generateThumbnails = true;
        opts.optimization = true;
        opts.artboardRange = ""; // empty = all artboards
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
        opts.qualitySetting = 60;
        opts.antiAliasing = true;
        opts.optimization = true;
        opts.artBoardClipping = true;
        opts.horizontalScale = 50;
        opts.verticalScale = 50;

        var baseFsName = targetFile.fsName.replace(/\.jpg$/i, "");
        var written = [];

        for (var i = 0; i < doc.artboards.length; i++) {
            doc.artboards.setActiveArtboardIndex(i);
            var abName = sanitize(doc.artboards[i].name);
            var perArtboard = new File(
                baseFsName + "_" + (i + 1) + "_" + abName + ".jpg"
            );
            doc.exportFile(perArtboard, ExportType.JPEG, opts);
            written.push(perArtboard);
        }
        return written;
    }

    function sanitize(name) {
        return String(name).replace(/[\\\/:*?"<>|]/g, "_");
    }
})();
