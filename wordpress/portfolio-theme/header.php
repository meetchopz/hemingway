<?php
/**
 * Header template.
 *
 * @package Portfolio_Theme
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="pt-header">
	<div class="pt-container pt-header__inner">
		<div class="pt-brand">
			<?php
			if ( has_custom_logo() ) {
				the_custom_logo();
			} else {
				printf( '<a href="%s" style="color:inherit;">%s</a>', esc_url( home_url( '/' ) ), esc_html( get_bloginfo( 'name' ) ) );
			}
			?>
		</div>

		<button class="pt-nav-toggle" aria-label="<?php esc_attr_e( 'Toggle menu', 'portfolio-theme' ); ?>" aria-expanded="false">
			<span></span><span></span><span></span>
		</button>

		<nav class="pt-nav" aria-label="<?php esc_attr_e( 'Primary', 'portfolio-theme' ); ?>">
			<?php
			if ( has_nav_menu( 'primary' ) ) {
				wp_nav_menu( array(
					'theme_location' => 'primary',
					'container'      => false,
					'menu_class'     => '',
					'fallback_cb'    => false,
				) );
			} else {
				echo '<ul>';
				echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'portfolio-theme' ) . '</a></li>';
				echo '<li><a href="' . esc_url( home_url( '/?page_id=portfolio' ) ) . '">' . esc_html__( 'Portfolio', 'portfolio-theme' ) . '</a></li>';
				echo '<li><a href="' . esc_url( home_url( '/?page_id=services' ) ) . '">' . esc_html__( 'Services', 'portfolio-theme' ) . '</a></li>';
				echo '</ul>';
			}
			?>
		</nav>
	</div>
</header>

<main id="content" class="pt-main">
