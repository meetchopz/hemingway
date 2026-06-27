<?php
/**
 * Template Name: Services
 *
 * Assign this template to a Page (e.g. "Services") to display all services.
 *
 * @package Portfolio_Theme
 */

get_header();
?>

<section class="pt-section">
	<div class="pt-container">
		<div class="pt-section__head">
			<span class="pt-eyebrow"><?php esc_html_e( 'What I offer', 'portfolio-theme' ); ?></span>
			<h1><?php the_title(); ?></h1>
			<?php
			while ( have_posts() ) :
				the_post();
				if ( trim( get_the_content() ) ) {
					echo '<div class="pt-page-content">';
					the_content();
					echo '</div>';
				}
			endwhile;
			?>
		</div>

		<?php
		$services = new WP_Query( array(
			'post_type'      => 'pt_service',
			'posts_per_page' => -1,
			'orderby'        => 'menu_order date',
			'order'          => 'ASC',
		) );

		if ( $services->have_posts() ) : ?>
			<div class="pt-grid pt-grid--3">
				<?php while ( $services->have_posts() ) : $services->the_post(); ?>
					<?php pt_render_service_card(); ?>
				<?php endwhile; ?>
			</div>
			<?php wp_reset_postdata(); ?>
		<?php else : ?>
			<p style="text-align:center;color:var(--pt-muted);"><?php esc_html_e( 'No services to show yet. Add some under Services in your WordPress admin.', 'portfolio-theme' ); ?></p>
		<?php endif; ?>
	</div>
</section>

<!-- CTA -->
<section class="pt-section pt-section--muted">
	<div class="pt-container">
		<div class="pt-cta">
			<h2><?php esc_html_e( 'Ready to start?', 'portfolio-theme' ); ?></h2>
			<p><?php esc_html_e( 'Tell me about your project and I’ll get back to you shortly.', 'portfolio-theme' ); ?></p>
			<a class="pt-btn" href="<?php echo esc_url( home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Contact me', 'portfolio-theme' ); ?></a>
		</div>
	</div>
</section>

<?php
get_footer();
