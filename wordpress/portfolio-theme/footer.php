<?php
/**
 * Footer template.
 *
 * @package Portfolio_Theme
 */
?>
</main><!-- #content -->

<footer class="pt-footer">
	<div class="pt-container pt-footer__inner">
		<small>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( get_bloginfo( 'name' ) ); ?>. <?php esc_html_e( 'All rights reserved.', 'portfolio-theme' ); ?></small>
		<?php pt_social_links(); ?>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
