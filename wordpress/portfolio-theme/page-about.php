<?php
/**
 * Template Name: About
 *
 * Assign this template to a Page (e.g. "About"). Set a Featured Image for the photo,
 * and write your bio in the page content. Skills can be added as a comma-separated
 * list inside a paragraph that starts with "Skills:".
 *
 * @package Portfolio_Theme
 */

get_header();

while ( have_posts() ) :
	the_post();
	?>
	<section class="pt-section">
		<div class="pt-container">
			<div class="pt-about">
				<div class="pt-about__photo">
					<?php if ( has_post_thumbnail() ) : ?>
						<?php the_post_thumbnail( 'large', array( 'alt' => esc_attr( get_the_title() ) ) ); ?>
					<?php else : ?>
						<div class="pt-about__photo--placeholder">&#128100;</div>
					<?php endif; ?>
				</div>
				<div class="pt-about__text">
					<span class="pt-eyebrow"><?php esc_html_e( 'About me', 'portfolio-theme' ); ?></span>
					<h1><?php the_title(); ?></h1>
					<div class="pt-page-content"><?php the_content(); ?></div>
				</div>
			</div>
		</div>
	</section>
	<?php
endwhile;

get_footer();
