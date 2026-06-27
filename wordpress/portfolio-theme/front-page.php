<?php
/**
 * Front page (homepage) template.
 *
 * @package Portfolio_Theme
 */

get_header();
?>

<!-- Hero -->
<section class="pt-hero">
	<div class="pt-container">
		<span class="pt-eyebrow"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></span>
		<h1><?php echo esc_html( get_theme_mod( 'pt_hero_title', __( 'Hi, I build thoughtful digital work.', 'portfolio-theme' ) ) ); ?></h1>
		<p class="pt-hero__lead"><?php echo esc_html( get_theme_mod( 'pt_hero_subtitle', __( 'A personal portfolio showcasing my projects and the services I offer.', 'portfolio-theme' ) ) ); ?></p>
		<div class="pt-hero__actions">
			<a class="pt-btn" href="#portfolio"><?php esc_html_e( 'View my work', 'portfolio-theme' ); ?></a>
			<a class="pt-btn pt-btn--ghost" href="#services"><?php esc_html_e( 'See services', 'portfolio-theme' ); ?></a>
		</div>
	</div>
</section>

<!-- Featured portfolio -->
<section id="portfolio" class="pt-section pt-section--muted">
	<div class="pt-container">
		<div class="pt-section__head">
			<span class="pt-eyebrow"><?php esc_html_e( 'Selected work', 'portfolio-theme' ); ?></span>
			<h2><?php esc_html_e( 'Portfolio', 'portfolio-theme' ); ?></h2>
			<p><?php esc_html_e( 'A few projects I am proud of.', 'portfolio-theme' ); ?></p>
		</div>

		<?php
		$projects = new WP_Query( array(
			'post_type'      => 'pt_project',
			'posts_per_page' => 6,
			'orderby'        => 'menu_order date',
			'order'          => 'ASC',
		) );

		if ( $projects->have_posts() ) : ?>
			<div class="pt-grid pt-grid--3">
				<?php while ( $projects->have_posts() ) : $projects->the_post(); ?>
					<?php pt_render_project_card(); ?>
				<?php endwhile; ?>
			</div>
			<div style="text-align:center;margin-top:40px;">
				<a class="pt-btn pt-btn--ghost" href="<?php echo esc_url( get_post_type_archive_link( 'pt_project' ) ); ?>"><?php esc_html_e( 'View all projects', 'portfolio-theme' ); ?></a>
			</div>
			<?php wp_reset_postdata(); ?>
		<?php else : ?>
			<p style="text-align:center;color:var(--pt-muted);"><?php esc_html_e( 'No projects yet. Add some under Portfolio in your WordPress admin.', 'portfolio-theme' ); ?></p>
		<?php endif; ?>
	</div>
</section>

<!-- Services -->
<section id="services" class="pt-section">
	<div class="pt-container">
		<div class="pt-section__head">
			<span class="pt-eyebrow"><?php esc_html_e( 'What I offer', 'portfolio-theme' ); ?></span>
			<h2><?php esc_html_e( 'Services', 'portfolio-theme' ); ?></h2>
			<p><?php esc_html_e( 'How I can help you and your project.', 'portfolio-theme' ); ?></p>
		</div>

		<?php
		$services = new WP_Query( array(
			'post_type'      => 'pt_service',
			'posts_per_page' => 6,
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
			<p style="text-align:center;color:var(--pt-muted);"><?php esc_html_e( 'No services yet. Add some under Services in your WordPress admin.', 'portfolio-theme' ); ?></p>
		<?php endif; ?>
	</div>
</section>

<!-- CTA -->
<section class="pt-section pt-section--muted">
	<div class="pt-container">
		<div class="pt-cta">
			<h2><?php esc_html_e( 'Have a project in mind?', 'portfolio-theme' ); ?></h2>
			<p><?php esc_html_e( 'Let’s talk about how I can help bring your idea to life.', 'portfolio-theme' ); ?></p>
			<a class="pt-btn" href="<?php echo esc_url( home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Get in touch', 'portfolio-theme' ); ?></a>
		</div>
	</div>
</section>

<?php
get_footer();
