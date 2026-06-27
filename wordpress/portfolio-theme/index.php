<?php
/**
 * Fallback template (blog / archive / search).
 *
 * @package Portfolio_Theme
 */

get_header();
?>

<section class="pt-section">
	<div class="pt-container">
		<div class="pt-section__head">
			<h1>
				<?php
				if ( is_post_type_archive( 'pt_project' ) ) {
					esc_html_e( 'Portfolio', 'portfolio-theme' );
				} elseif ( is_search() ) {
					printf( esc_html__( 'Search results for: %s', 'portfolio-theme' ), '<span>' . esc_html( get_search_query() ) . '</span>' );
				} elseif ( is_archive() ) {
					the_archive_title();
				} else {
					echo esc_html( get_the_title( get_option( 'page_for_posts' ) ) ?: __( 'Latest posts', 'portfolio-theme' ) );
				}
				?>
			</h1>
		</div>

		<?php if ( have_posts() ) : ?>
			<?php if ( is_post_type_archive( 'pt_project' ) ) : ?>
				<div class="pt-grid pt-grid--3">
					<?php while ( have_posts() ) : the_post(); ?>
						<?php pt_render_project_card(); ?>
					<?php endwhile; ?>
				</div>
			<?php else : ?>
				<div class="pt-grid pt-grid--2">
					<?php while ( have_posts() ) : the_post(); ?>
						<article class="pt-card">
							<?php if ( has_post_thumbnail() ) : ?>
								<a class="pt-card__media" href="<?php the_permalink(); ?>"><?php the_post_thumbnail( 'pt-card' ); ?></a>
							<?php endif; ?>
							<div class="pt-card__body">
								<h3 class="pt-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
								<p class="pt-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 24 ) ); ?></p>
								<a class="pt-card__link" href="<?php the_permalink(); ?>"><?php esc_html_e( 'Read more →', 'portfolio-theme' ); ?></a>
							</div>
						</article>
					<?php endwhile; ?>
				</div>
			<?php endif; ?>

			<div style="text-align:center;margin-top:48px;">
				<?php the_posts_pagination( array( 'mid_size' => 2 ) ); ?>
			</div>
		<?php else : ?>
			<p style="text-align:center;color:var(--pt-muted);"><?php esc_html_e( 'Nothing found.', 'portfolio-theme' ); ?></p>
		<?php endif; ?>
	</div>
</section>

<?php
get_footer();
