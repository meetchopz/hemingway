<?php
/**
 * Default page template (used for any Page without a custom template).
 *
 * @package Portfolio_Theme
 */

get_header();

while ( have_posts() ) :
	the_post();
	?>
	<section class="pt-section">
		<div class="pt-container">
			<div class="pt-section__head">
				<h1><?php the_title(); ?></h1>
			</div>
			<div class="pt-page-content"><?php the_content(); ?></div>
		</div>
	</section>
	<?php
endwhile;

get_footer();
