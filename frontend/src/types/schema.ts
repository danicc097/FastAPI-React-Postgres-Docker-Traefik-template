/* eslint-disable */
/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/api/users/": {
    post: operations["users_register_new_user_api_users__post"];
  };
  "/api/users/me/": {
    get: operations["users_get_current_user_api_users_me__get"];
    /** Update the user's profile. */
    put: operations["users_update_user_by_id_api_users_me__put"];
  };
  "/api/users/login/token/": {
    post: operations["users_login_email_and_password_api_users_login_token__post"];
  };
  "/api/users/request-password-reset/": {
    /** Any client, including unauthorized, can request a password reset that needs admin approval. */
    post: operations["users_request_password_reset_api_users_request_password_reset__post"];
  };
  "/api/users/notifications-by-last-read/": {
    get: operations["users_get_feed_by_last_read_api_users_notifications_by_last_read__get"];
  };
  "/api/users/notifications/": {
    get: operations["users_get_feed_api_users_notifications__get"];
  };
  "/api/users/check-user-has-unread-notifications/": {
    /**
     * Hit the server to check if the user has unread notifications.
     * It won't update the user's ``last_notification_at`` field.
     */
    get: operations["users_check_user_has_unread_notifications_api_users_check_user_has_unread_notifications__get"];
  };
  "/api/profiles/{username}/": {
    get: operations["profiles_get_profile_by_username_api_profiles__username___get"];
  };
  "/api/profiles/me/": {
    put: operations["profiles_update_own_profile_api_profiles_me__put"];
  };
  "/api/admin/users/": {
    /** List all users in the database. */
    get: operations["admin_list_users_api_admin_users__get"];
  };
  "/api/admin/users-unverified/": {
    /** List all unverified users. */
    get: operations["admin_list_unverified_users_api_admin_users_unverified__get"];
    /** Verify registered users via an array of emails. */
    post: operations["admin_verify_users_by_email_api_admin_users_unverified__post"];
  };
  "/api/admin/reset-user-password/": {
    /** Return a list of users that have requested a password reset. */
    get: operations["admin_list_password_request_users_api_admin_reset_user_password__get"];
    /** Reset password for any user by email. */
    post: operations["admin_reset_user_password_by_email_api_admin_reset_user_password__post"];
  };
  "/api/admin/delete-password-reset-request/{id}/": {
    /** Delete a password reset request with id: ``id``. */
    delete: operations["admin_delete_password_reset_request_api_admin_delete_password_reset_request__id___delete"];
  };
  "/api/admin/create-notification/": {
    /** Create a new notification for selected user roles to receive. */
    post: operations["admin_create_notification_api_admin_create_notification__post"];
  };
  "/api/admin/delete-notification/{id}/": {
    /** Delete a notification with id: ``id``. */
    delete: operations["admin_delete_notification_api_admin_delete_notification__id___delete"];
  };
  "/api/admin/change-user-role/": {
    /** Change role of user */
    post: operations["admin_change_user_role_api_admin_change_user_role__post"];
  };
}

export interface components {
  schemas: {
    /** ``access_token``: allows for flexibility to modify our authentication system. */
    AccessToken: {
      access_token: string;
      token_type: string;
    };
    Body_admin_change_user_role_api_admin_change_user_role__post: {
      role_update: components["schemas"]["RoleUpdate"];
    };
    Body_admin_create_notification_api_admin_create_notification__post: {
      notification: components["schemas"]["GlobalNotificationCreate"];
    };
    Body_admin_reset_user_password_by_email_api_admin_reset_user_password__post: {
      email: string;
    };
    Body_admin_verify_users_by_email_api_admin_users_unverified__post: {
      user_emails: string[];
    };
    Body_profiles_update_own_profile_api_profiles_me__put: {
      profile_update: components["schemas"]["ProfileUpdate"];
    };
    Body_users_login_email_and_password_api_users_login_token__post: {
      grant_type?: string;
      username: string;
      password: string;
      scope?: string;
      client_id?: string;
      client_secret?: string;
    };
    Body_users_register_new_user_api_users__post: {
      new_user: components["schemas"]["UserCreate"];
    };
    Body_users_request_password_reset_api_users_request_password_reset__post: {
      password_request: components["schemas"]["PasswordResetRequestCreate"];
    };
    Body_users_update_user_by_id_api_users_me__put: {
      user_update: components["schemas"]["UserUpdate"];
    };
    /** Admins and authorized roles can send notifications to users based on role. */
    GlobalNotification: {
      id: number;
      created_at?: string;
      updated_at?: string;
      sender: string;
      receiver_role: components["schemas"]["Role"];
      title: string;
      body: string;
      label: string;
      link?: string;
    };
    /** Any common logic to be shared by all models goes here */
    GlobalNotificationCreate: {
      sender: string;
      receiver_role: components["schemas"]["Role"];
      title: string;
      body: string;
      label: string;
      link?: string;
    };
    /** Admins and authorized roles can send notifications to users based on role. */
    GlobalNotificationFeedItem: {
      row_number?: number;
      event_timestamp?: string;
      id: number;
      created_at?: string;
      updated_at?: string;
      sender: string;
      receiver_role: components["schemas"]["Role"];
      title: string;
      body: string;
      label: string;
      link?: string;
      event_type?: "is_update" | "is_create";
    };
    HTTPValidationError: {
      detail?: components["schemas"]["ValidationError"][];
    };
    /** Users can request a password reset to an administrator. */
    PasswordResetRequest: {
      id: number;
      created_at?: string;
      updated_at?: string;
      email: string;
      message: string;
    };
    /** Users can request a password reset to an administrator. */
    PasswordResetRequestCreate: {
      email: string;
      message: string;
    };
    /** To be used by all models that have an ID primary key column. */
    ProfilePublic: {
      full_name?: string;
      phone_number?: string;
      bio?: string;
      image?: string;
      created_at?: string;
      updated_at?: string;
      id: number;
      user_id: number;
      username?: string;
      email?: string;
    };
    /** Allow users to update any or no fields, as long as it's not user_id */
    ProfileUpdate: {
      full_name?: string;
      phone_number?: string;
      bio?: string;
      image?: string;
    };
    /** An enumeration. */
    Role: "user" | "manager" | "admin";
    /** Any common logic to be shared by all models goes here */
    RoleUpdate: {
      email: string;
      role: components["schemas"]["Role"];
    };
    /** Email, username, and password are required for registering a new user */
    UserCreate: {
      email: string;
      password: string;
      username: string;
    };
    /**
     * By accepting an optional access_token attribute, we can now return the
     * user along with their token as soon as they've registered.
     * We also have the ability to attach a user profile
     */
    UserPublic: {
      email?: string;
      username?: string;
      is_verified?: boolean;
      is_active?: boolean;
      is_superuser?: boolean;
      role?: components["schemas"]["Role"];
      last_notification_at?: string;
      created_at?: string;
      updated_at?: string;
      id: number;
      access_token?: components["schemas"]["AccessToken"];
      profile?: components["schemas"]["ProfilePublic"];
    };
    /** Users are allowed to update their email, username or password */
    UserUpdate: {
      password?: string;
      old_password?: string;
      email?: string;
      username?: string;
    };
    ValidationError: {
      loc: string[];
      msg: string;
      type: string;
    };
  };
}

export interface operations {
  users_register_new_user_api_users__post: {
    responses: {
      /** Successful Response */
      201: {
        content: {
          "application/json": components["schemas"]["UserPublic"];
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["Body_users_register_new_user_api_users__post"];
      };
    };
  };
  users_get_current_user_api_users_me__get: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["UserPublic"];
        };
      };
    };
  };
  /** Update the user's profile. */
  users_update_user_by_id_api_users_me__put: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["UserPublic"];
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["Body_users_update_user_by_id_api_users_me__put"];
      };
    };
  };
  users_login_email_and_password_api_users_login_token__post: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["AccessToken"];
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
    requestBody: {
      content: {
        "application/x-www-form-urlencoded": components["schemas"]["Body_users_login_email_and_password_api_users_login_token__post"];
      };
    };
  };
  /** Any client, including unauthorized, can request a password reset that needs admin approval. */
  users_request_password_reset_api_users_request_password_reset__post: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["PasswordResetRequest"];
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["Body_users_request_password_reset_api_users_request_password_reset__post"];
      };
    };
  };
  users_get_feed_by_last_read_api_users_notifications_by_last_read__get: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["GlobalNotificationFeedItem"][];
        };
      };
    };
  };
  users_get_feed_api_users_notifications__get: {
    parameters: {
      query: {
        /** Number of notifications to retrieve */
        page_chunk_size?: number;
        /** Used to determine the timestamp at which to begin querying for notification feed items. */
        starting_date?: string;
      };
    };
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["GlobalNotificationFeedItem"][];
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  /**
   * Hit the server to check if the user has unread notifications.
   * It won't update the user's ``last_notification_at`` field.
   */
  users_check_user_has_unread_notifications_api_users_check_user_has_unread_notifications__get: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": boolean;
        };
      };
    };
  };
  profiles_get_profile_by_username_api_profiles__username___get: {
    parameters: {
      path: {
        username: string;
      };
    };
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["ProfilePublic"];
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  profiles_update_own_profile_api_profiles_me__put: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["ProfilePublic"];
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["Body_profiles_update_own_profile_api_profiles_me__put"];
      };
    };
  };
  /** List all users in the database. */
  admin_list_users_api_admin_users__get: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["UserPublic"][];
        };
      };
    };
  };
  /** List all unverified users. */
  admin_list_unverified_users_api_admin_users_unverified__get: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["UserPublic"][];
        };
      };
    };
  };
  /** Verify registered users via an array of emails. */
  admin_verify_users_by_email_api_admin_users_unverified__post: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["UserPublic"][];
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["Body_admin_verify_users_by_email_api_admin_users_unverified__post"];
      };
    };
  };
  /** Return a list of users that have requested a password reset. */
  admin_list_password_request_users_api_admin_reset_user_password__get: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["PasswordResetRequest"][];
        };
      };
    };
  };
  /** Reset password for any user by email. */
  admin_reset_user_password_by_email_api_admin_reset_user_password__post: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": string;
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["Body_admin_reset_user_password_by_email_api_admin_reset_user_password__post"];
      };
    };
  };
  /** Delete a password reset request with id: ``id``. */
  admin_delete_password_reset_request_api_admin_delete_password_reset_request__id___delete: {
    parameters: {
      path: {
        id: number;
      };
    };
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["PasswordResetRequest"][];
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  /** Create a new notification for selected user roles to receive. */
  admin_create_notification_api_admin_create_notification__post: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": unknown;
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["Body_admin_create_notification_api_admin_create_notification__post"];
      };
    };
  };
  /** Delete a notification with id: ``id``. */
  admin_delete_notification_api_admin_delete_notification__id___delete: {
    parameters: {
      path: {
        id: number;
      };
    };
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["GlobalNotification"];
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  /** Change role of user */
  admin_change_user_role_api_admin_change_user_role__post: {
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["UserPublic"];
        };
      };
      /** Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["Body_admin_change_user_role_api_admin_change_user_role__post"];
      };
    };
  };
}

export interface external {}
