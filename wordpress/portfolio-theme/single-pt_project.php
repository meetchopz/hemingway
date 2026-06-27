<?php
/**
 * Single project view.
 *
 * @package Portfolio_Theme
 */

get_header();

while ( have_posts() ) :
	the_post();
	$url   = get_post_meta( get_the_ID(), '_pt_project_url', true );
	$terms = get_the_terms( get_the_ID(), 'pt_project_type' );
	?>
	<article class="pt-section">
		<div class="pt-container">
			<div class="pt-single__hero">
				<a class="pt-back" href="<?php echo esc_url( get_post_type_archive_link( 'pt_project' ) ); ?>">&larr; <?php esc_html_e( 'Back to portfolio', 'portfolio-theme' ); ?></a>
				<h1><?php the_title(); ?></h1>
				<?php if ( $terms && ! is_wp_error( $terms ) ) : ?>
					<div class="pt-single__meta">
						<?php echo esc_html( implode( ', ', wp_list_pluck( $terms, 'name' ) ) ); ?>
					</div>
				<?php endif; ?>
				<?php if ( $url ) : ?>
					<a class="pt-btn" href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Visit live project →', 'portfolio-theme' ); ?></a>
				<?php endif; ?>
			</div>

			<?php if ( has_post_thumbnail() ) : ?>
				<div class="pt-single__featured"><?php the_post_thumbnail( 'large' ); ?></div>
			<?php endif; ?>

			<div class="pt-single__content">
				<?php the_content(); ?>
			</div>
		</div>
	</article>
	<?php
endwhile;

get_footer();
