<?php
/**
 * Template Name: Portfolio
 *
 * Assign this template to a Page (e.g. "Portfolio") to display all projects.
 *
 * @package Portfolio_Theme
 */

get_header();
?>

<section class="pt-section">
	<div class="pt-container">
		<div class="pt-section__head">
			<span class="pt-eyebrow"><?php esc_html_e( 'Selected work', 'portfolio-theme' ); ?></span>
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
		// Optional filter by project type.
		$active_type = isset( $_GET['type'] ) ? sanitize_title( wp_unslash( $_GET['type'] ) ) : '';
		$types       = get_terms( array( 'taxonomy' => 'pt_project_type', 'hide_empty' => true ) );

		if ( $types && ! is_wp_error( $types ) ) : ?>
			<div style="text-align:center;margin-bottom:36px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
				<a class="pt-btn pt-btn--ghost<?php echo $active_type ? '' : ' is-active'; ?>" href="<?php echo esc_url( get_permalink() ); ?>"><?php esc_html_e( 'All', 'portfolio-theme' ); ?></a>
				<?php foreach ( $types as $type ) : ?>
					<a class="pt-btn pt-btn--ghost" href="<?php echo esc_url( add_query_arg( 'type', $type->slug, get_permalink() ) ); ?>"><?php echo esc_html( $type->name ); ?></a>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>

		<?php
		$args = array(
			'post_type'      => 'pt_project',
			'posts_per_page' => 12,
			'orderby'        => 'menu_order date',
			'order'          => 'ASC',
			'paged'          => max( 1, get_query_var( 'paged' ), get_query_var( 'page' ) ),
		);
		if ( $active_type ) {
			$args['tax_query'] = array( array(
				'taxonomy' => 'pt_project_type',
				'field'    => 'slug',
				'terms'    => $active_type,
			) );
		}
		$projects = new WP_Query( $args );

		if ( $projects->have_posts() ) : ?>
			<div class="pt-grid pt-grid--3">
				<?php while ( $projects->have_posts() ) : $projects->the_post(); ?>
					<?php pt_render_project_card(); ?>
				<?php endwhile; ?>
			</div>

			<div style="text-align:center;margin-top:48px;">
				<?php
				echo paginate_links( array(
					'total'   => $projects->max_num_pages,
					'current' => max( 1, get_query_var( 'paged' ), get_query_var( 'page' ) ),
				) );
				?>
			</div>
			<?php wp_reset_postdata(); ?>
		<?php else : ?>
			<p style="text-align:center;color:var(--pt-muted);"><?php esc_html_e( 'No projects to show yet.', 'portfolio-theme' ); ?></p>
		<?php endif; ?>
	</div>
</section>

<?php
get_footer();
