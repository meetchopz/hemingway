/* Portfolio & Services theme — front-end behaviour */
(function () {
	'use strict';

	// Mobile nav toggle.
	var toggle = document.querySelector('.pt-nav-toggle');
	var nav = document.querySelector('.pt-nav');

	if (toggle && nav) {
		toggle.addEventListener('click', function () {
			var open = nav.classList.toggle('is-open');
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
		});

		// Close menu when a link is clicked (mobile).
		nav.addEventListener('click', function (e) {
			if (e.target.tagName === 'A') {
				nav.classList.remove('is-open');
				toggle.setAttribute('aria-expanded', 'false');
			}
		});
	}

	// Smooth-scroll for same-page anchors (graceful enhancement).
	document.querySelectorAll('a[href^="#"]').forEach(function (link) {
		link.addEventListener('click', function (e) {
			var id = link.getAttribute('href');
			if (id.length > 1) {
				var target = document.querySelector(id);
				if (target) {
					e.preventDefault();
					target.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}
		});
	});
})();
