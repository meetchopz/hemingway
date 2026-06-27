<?php
/**
 * Portfolio & Services theme functions.
 *
 * @package Portfolio_Theme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

define( 'PT_VERSION', '1.0.0' );

/* =============================================================
 * Theme setup
 * ============================================================= */
function pt_theme_setup() {
	load_theme_textdomain( 'portfolio-theme', get_template_directory() . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'custom-logo', array(
		'height'      => 60,
		'width'       => 200,
		'flex-height' => true,
		'flex-width'  => true,
	) );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );

	register_nav_menus( array(
		'primary' => __( 'Primary Menu', 'portfolio-theme' ),
	) );

	add_image_size( 'pt-card', 720, 450, true );
}
add_action( 'after_setup_theme', 'pt_theme_setup' );

/* =============================================================
 * Enqueue assets
 * ============================================================= */
function pt_enqueue_assets() {
	wp_enqueue_style( 'portfolio-theme-style', get_stylesheet_uri(), array(), PT_VERSION );
	wp_enqueue_script( 'portfolio-theme-script', get_template_directory_uri() . '/assets/js/main.js', array(), PT_VERSION, true );
}
add_action( 'wp_enqueue_scripts', 'pt_enqueue_assets' );

/* =============================================================
 * Custom Post Type: Portfolio
 * ============================================================= */
function pt_register_portfolio_cpt() {
	$labels = array(
		'name'               => __( 'Portfolio', 'portfolio-theme' ),
		'singular_name'      => __( 'Project', 'portfolio-theme' ),
		'add_new'            => __( 'Add New Project', 'portfolio-theme' ),
		'add_new_item'       => __( 'Add New Project', 'portfolio-theme' ),
		'edit_item'          => __( 'Edit Project', 'portfolio-theme' ),
		'new_item'           => __( 'New Project', 'portfolio-theme' ),
		'view_item'          => __( 'View Project', 'portfolio-theme' ),
		'search_items'       => __( 'Search Projects', 'portfolio-theme' ),
		'not_found'          => __( 'No projects found', 'portfolio-theme' ),
		'menu_name'          => __( 'Portfolio', 'portfolio-theme' ),
	);

	register_post_type( 'pt_project', array(
		'labels'       => $labels,
		'public'       => true,
		'has_archive'  => true,
		'menu_icon'    => 'dashicons-portfolio',
		'menu_position'=> 20,
		'rewrite'      => array( 'slug' => 'portfolio' ),
		'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt', 'page-attributes' ),
		'show_in_rest' => true,
	) );

	// Project category taxonomy.
	register_taxonomy( 'pt_project_type', 'pt_project', array(
		'labels'       => array(
			'name'          => __( 'Project Types', 'portfolio-theme' ),
			'singular_name' => __( 'Project Type', 'portfolio-theme' ),
		),
		'public'       => true,
		'hierarchical' => true,
		'show_in_rest' => true,
		'rewrite'      => array( 'slug' => 'project-type' ),
	) );
}
add_action( 'init', 'pt_register_portfolio_cpt' );

/* =============================================================
 * Custom Post Type: Services
 * ============================================================= */
function pt_register_service_cpt() {
	$labels = array(
		'name'          => __( 'Services', 'portfolio-theme' ),
		'singular_name' => __( 'Service', 'portfolio-theme' ),
		'add_new'       => __( 'Add New Service', 'portfolio-theme' ),
		'add_new_item'  => __( 'Add New Service', 'portfolio-theme' ),
		'edit_item'     => __( 'Edit Service', 'portfolio-theme' ),
		'new_item'      => __( 'New Service', 'portfolio-theme' ),
		'view_item'     => __( 'View Service', 'portfolio-theme' ),
		'search_items'  => __( 'Search Services', 'portfolio-theme' ),
		'not_found'     => __( 'No services found', 'portfolio-theme' ),
		'menu_name'     => __( 'Services', 'portfolio-theme' ),
	);

	register_post_type( 'pt_service', array(
		'labels'       => $labels,
		'public'       => true,
		'has_archive'  => false,
		'menu_icon'    => 'dashicons-hammer',
		'menu_position'=> 21,
		'rewrite'      => array( 'slug' => 'service' ),
		'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt', 'page-attributes' ),
		'show_in_rest' => true,
	) );
}
add_action( 'init', 'pt_register_service_cpt' );

/* =============================================================
 * Service meta box: icon (emoji) + price
 * ============================================================= */
function pt_add_service_meta_box() {
	add_meta_box( 'pt_service_meta', __( 'Service Details', 'portfolio-theme' ), 'pt_service_meta_box_html', 'pt_service', 'side' );
}
add_action( 'add_meta_boxes', 'pt_add_service_meta_box' );

function pt_service_meta_box_html( $post ) {
	wp_nonce_field( 'pt_service_meta', 'pt_service_meta_nonce' );
	$icon  = get_post_meta( $post->ID, '_pt_service_icon', true );
	$price = get_post_meta( $post->ID, '_pt_service_price', true );
	?>
	<p>
		<label for="pt_service_icon"><strong><?php esc_html_e( 'Icon (emoji)', 'portfolio-theme' ); ?></strong></label><br>
		<input type="text" id="pt_service_icon" name="pt_service_icon" value="<?php echo esc_attr( $icon ); ?>" placeholder="&#9889;" style="width:100%;" maxlength="4">
	</p>
	<p>
		<label for="pt_service_price"><strong><?php esc_html_e( 'Price label', 'portfolio-theme' ); ?></strong></label><br>
		<input type="text" id="pt_service_price" name="pt_service_price" value="<?php echo esc_attr( $price ); ?>" placeholder="<?php esc_attr_e( 'From $500', 'portfolio-theme' ); ?>" style="width:100%;">
	</p>
	<?php
}

function pt_save_service_meta( $post_id ) {
	if ( ! isset( $_POST['pt_service_meta_nonce'] ) || ! wp_verify_nonce( $_POST['pt_service_meta_nonce'], 'pt_service_meta' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	if ( isset( $_POST['pt_service_icon'] ) ) {
		update_post_meta( $post_id, '_pt_service_icon', sanitize_text_field( wp_unslash( $_POST['pt_service_icon'] ) ) );
	}
	if ( isset( $_POST['pt_service_price'] ) ) {
		update_post_meta( $post_id, '_pt_service_price', sanitize_text_field( wp_unslash( $_POST['pt_service_price'] ) ) );
	}
}
add_action( 'save_post_pt_service', 'pt_save_service_meta' );

/* =============================================================
 * Portfolio meta box: external project URL
 * ============================================================= */
function pt_add_project_meta_box() {
	add_meta_box( 'pt_project_meta', __( 'Project Details', 'portfolio-theme' ), 'pt_project_meta_box_html', 'pt_project', 'side' );
}
add_action( 'add_meta_boxes', 'pt_add_project_meta_box' );

function pt_project_meta_box_html( $post ) {
	wp_nonce_field( 'pt_project_meta', 'pt_project_meta_nonce' );
	$url = get_post_meta( $post->ID, '_pt_project_url', true );
	?>
	<p>
		<label for="pt_project_url"><strong><?php esc_html_e( 'Live / external URL', 'portfolio-theme' ); ?></strong></label><br>
		<input type="url" id="pt_project_url" name="pt_project_url" value="<?php echo esc_attr( $url ); ?>" placeholder="https://" style="width:100%;">
	</p>
	<?php
}

function pt_save_project_meta( $post_id ) {
	if ( ! isset( $_POST['pt_project_meta_nonce'] ) || ! wp_verify_nonce( $_POST['pt_project_meta_nonce'], 'pt_project_meta' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	if ( isset( $_POST['pt_project_url'] ) ) {
		update_post_meta( $post_id, '_pt_project_url', esc_url_raw( wp_unslash( $_POST['pt_project_url'] ) ) );
	}
}
add_action( 'save_post_pt_project', 'pt_save_project_meta' );

/* =============================================================
 * Customizer: contact details + social + hero copy
 * ============================================================= */
function pt_customize_register( $wp_customize ) {
	$wp_customize->add_section( 'pt_options', array(
		'title'    => __( 'Theme Options', 'portfolio-theme' ),
		'priority' => 30,
	) );

	$fields = array(
		'pt_hero_title'    => array( __( 'Hero title', 'portfolio-theme' ), __( 'Hi, I build thoughtful digital work.', 'portfolio-theme' ) ),
		'pt_hero_subtitle' => array( __( 'Hero subtitle', 'portfolio-theme' ), __( 'A personal portfolio showcasing my projects and the services I offer.', 'portfolio-theme' ) ),
		'pt_contact_email' => array( __( 'Contact email', 'portfolio-theme' ), '' ),
		'pt_contact_phone' => array( __( 'Contact phone', 'portfolio-theme' ), '' ),
		'pt_contact_location' => array( __( 'Location', 'portfolio-theme' ), '' ),
		'pt_social_github' => array( __( 'GitHub URL', 'portfolio-theme' ), '' ),
		'pt_social_linkedin' => array( __( 'LinkedIn URL', 'portfolio-theme' ), '' ),
		'pt_social_twitter' => array( __( 'X / Twitter URL', 'portfolio-theme' ), '' ),
		'pt_social_instagram' => array( __( 'Instagram URL', 'portfolio-theme' ), '' ),
	);

	foreach ( $fields as $id => $data ) {
		$wp_customize->add_setting( $id, array(
			'default'           => $data[1],
			'sanitize_callback' => ( false !== strpos( $id, 'social' ) ) ? 'esc_url_raw' : 'sanitize_text_field',
		) );
		$wp_customize->add_control( $id, array(
			'label'   => $data[0],
			'section' => 'pt_options',
			'type'    => 'text',
		) );
	}
}
add_action( 'customize_register', 'pt_customize_register' );

/* =============================================================
 * Contact form handler (no plugin required)
 * ============================================================= */
function pt_handle_contact_form() {
	if ( ! isset( $_POST['pt_contact_submit'] ) ) {
		return;
	}
	if ( ! isset( $_POST['pt_contact_nonce'] ) || ! wp_verify_nonce( $_POST['pt_contact_nonce'], 'pt_contact' ) ) {
		return;
	}

	// Honeypot — bots fill hidden fields.
	if ( ! empty( $_POST['pt_website'] ) ) {
		return;
	}

	$name    = isset( $_POST['pt_name'] ) ? sanitize_text_field( wp_unslash( $_POST['pt_name'] ) ) : '';
	$email   = isset( $_POST['pt_email'] ) ? sanitize_email( wp_unslash( $_POST['pt_email'] ) ) : '';
	$message = isset( $_POST['pt_message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['pt_message'] ) ) : '';

	if ( empty( $name ) || ! is_email( $email ) || empty( $message ) ) {
		set_transient( 'pt_contact_result_' . COOKIEHASH, 'err', 30 );
		return;
	}

	$to      = get_theme_mod( 'pt_contact_email', get_option( 'admin_email' ) );
	$subject = sprintf( '[%s] New message from %s', get_bloginfo( 'name' ), $name );
	$body    = "Name: {$name}\nEmail: {$email}\n\n{$message}";
	$headers = array( 'Reply-To: ' . $name . ' <' . $email . '>' );

	wp_mail( $to, $subject, $body, $headers );
	set_transient( 'pt_contact_result_' . COOKIEHASH, 'ok', 30 );
}
add_action( 'template_redirect', 'pt_handle_contact_form' );

/* =============================================================
 * Helpers
 * ============================================================= */

/**
 * Render a single portfolio card. Expects to be called inside the loop.
 */
function pt_render_project_card() {
	$tags  = get_the_terms( get_the_ID(), 'pt_project_type' );
	$tag   = ( $tags && ! is_wp_error( $tags ) ) ? $tags[0]->name : '';
	?>
	<article class="pt-card">
		<a class="pt-card__media" href="<?php the_permalink(); ?>">
			<?php if ( has_post_thumbnail() ) : ?>
				<?php the_post_thumbnail( 'pt-card', array( 'alt' => esc_attr( get_the_title() ) ) ); ?>
			<?php else : ?>
				<span class="pt-card__media pt-card__media--placeholder">&#9671;</span>
			<?php endif; ?>
		</a>
		<div class="pt-card__body">
			<?php if ( $tag ) : ?><span class="pt-card__tag"><?php echo esc_html( $tag ); ?></span><?php endif; ?>
			<h3 class="pt-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
			<p class="pt-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 18 ) ); ?></p>
			<a class="pt-card__link" href="<?php the_permalink(); ?>"><?php esc_html_e( 'View project →', 'portfolio-theme' ); ?></a>
		</div>
	</article>
	<?php
}

/**
 * Render a single service card. Expects to be called inside the loop.
 */
function pt_render_service_card() {
	$icon  = get_post_meta( get_the_ID(), '_pt_service_icon', true );
	$price = get_post_meta( get_the_ID(), '_pt_service_price', true );
	?>
	<article class="pt-service">
		<?php if ( $icon ) : ?><div class="pt-service__icon"><?php echo esc_html( $icon ); ?></div><?php endif; ?>
		<h3 class="pt-service__title"><?php the_title(); ?></h3>
		<p class="pt-service__desc"><?php echo esc_html( get_the_excerpt() ); ?></p>
		<?php if ( $price ) : ?><div class="pt-service__price"><?php echo esc_html( $price ); ?></div><?php endif; ?>
	</article>
	<?php
}

/**
 * Output social links markup if any are set.
 */
function pt_social_links() {
	$socials = array(
		'pt_social_github'    => 'GitHub',
		'pt_social_linkedin'  => 'LinkedIn',
		'pt_social_twitter'   => 'X',
		'pt_social_instagram' => 'Instagram',
	);
	$out = '';
	foreach ( $socials as $mod => $label ) {
		$url = get_theme_mod( $mod, '' );
		if ( $url ) {
			$out .= sprintf( '<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>', esc_url( $url ), esc_html( $label ) );
		}
	}
	if ( $out ) {
		echo '<div class="pt-footer__social">' . $out . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
}
