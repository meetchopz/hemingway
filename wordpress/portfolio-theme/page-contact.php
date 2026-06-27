<?php
/**
 * Template Name: Contact
 *
 * Assign this template to a Page (e.g. "Contact"). Messages are emailed to the
 * address set in Appearance > Customize > Theme Options (falls back to the admin email).
 *
 * @package Portfolio_Theme
 */

get_header();

$result = get_transient( 'pt_contact_result_' . COOKIEHASH );
if ( $result ) {
	delete_transient( 'pt_contact_result_' . COOKIEHASH );
}

$email    = get_theme_mod( 'pt_contact_email', '' );
$phone    = get_theme_mod( 'pt_contact_phone', '' );
$location = get_theme_mod( 'pt_contact_location', '' );
?>

<section class="pt-section">
	<div class="pt-container">
		<div class="pt-section__head">
			<span class="pt-eyebrow"><?php esc_html_e( 'Get in touch', 'portfolio-theme' ); ?></span>
			<h1><?php the_title(); ?></h1>
		</div>

		<div class="pt-contact">
			<div>
				<?php if ( 'ok' === $result ) : ?>
					<div class="pt-notice pt-notice--ok"><?php esc_html_e( 'Thanks! Your message has been sent.', 'portfolio-theme' ); ?></div>
				<?php elseif ( 'err' === $result ) : ?>
					<div class="pt-notice pt-notice--err"><?php esc_html_e( 'Please fill in all fields with a valid email and try again.', 'portfolio-theme' ); ?></div>
				<?php endif; ?>

				<?php
				while ( have_posts() ) :
					the_post();
					if ( trim( get_the_content() ) ) {
						echo '<div class="pt-page-content" style="margin-bottom:24px;">';
						the_content();
						echo '</div>';
					}
				endwhile;
				?>

				<form class="pt-form" method="post" action="">
					<?php wp_nonce_field( 'pt_contact', 'pt_contact_nonce' ); ?>
					<div>
						<label for="pt_name"><?php esc_html_e( 'Name', 'portfolio-theme' ); ?></label>
						<input type="text" id="pt_name" name="pt_name" required>
					</div>
					<div>
						<label for="pt_email"><?php esc_html_e( 'Email', 'portfolio-theme' ); ?></label>
						<input type="email" id="pt_email" name="pt_email" required>
					</div>
					<div>
						<label for="pt_message"><?php esc_html_e( 'Message', 'portfolio-theme' ); ?></label>
						<textarea id="pt_message" name="pt_message" required></textarea>
					</div>
					<?php // Honeypot field, hidden from humans. ?>
					<div style="position:absolute;left:-9999px;" aria-hidden="true">
						<label for="pt_website"><?php esc_html_e( 'Leave this empty', 'portfolio-theme' ); ?></label>
						<input type="text" id="pt_website" name="pt_website" tabindex="-1" autocomplete="off">
					</div>
					<div>
						<button type="submit" name="pt_contact_submit" class="pt-btn"><?php esc_html_e( 'Send message', 'portfolio-theme' ); ?></button>
					</div>
				</form>
			</div>

			<aside class="pt-contact__info">
				<h3><?php esc_html_e( 'Other ways to reach me', 'portfolio-theme' ); ?></h3>
				<?php if ( $email ) : ?>
					<div class="pt-contact__info-item"><strong><?php esc_html_e( 'Email', 'portfolio-theme' ); ?>:</strong> <a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a></div>
				<?php endif; ?>
				<?php if ( $phone ) : ?>
					<div class="pt-contact__info-item"><strong><?php esc_html_e( 'Phone', 'portfolio-theme' ); ?>:</strong> <?php echo esc_html( $phone ); ?></div>
				<?php endif; ?>
				<?php if ( $location ) : ?>
					<div class="pt-contact__info-item"><strong><?php esc_html_e( 'Location', 'portfolio-theme' ); ?>:</strong> <?php echo esc_html( $location ); ?></div>
				<?php endif; ?>
				<?php pt_social_links(); ?>
			</aside>
		</div>
	</div>
</section>

<?php
get_footer();
