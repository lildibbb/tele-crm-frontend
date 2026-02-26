> ⚠️ **This file is auto-generated.** Do not edit manually.
> Run `pnpm swagger:docs` to regenerate after code changes.
>
> Last generated: 2026-02-25T18:56:13.816Z

---

title: Titan Journal CRM API v1.0
language_tabs:

- http: HTTP
- javascript: JavaScript
  toc_footers: []
  includes: []
  search: false
  highlight_theme: darkula
  headingLevel: 2

---

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="titan-journal-crm-api">Titan Journal CRM API v1.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

**Titan Journal** — Enterprise Telegram IB CRM REST API

Base URLs:

- <a href="http://localhost:3001">http://localhost:3001</a>

# Authentication

- HTTP Authentication, scheme: bearer

* API Key (cookie)
  - Parameter Name: **refresh_token**, in: cookie.

<h1 id="titan-journal-crm-api-auth">auth</h1>

## AuthController_login

<a id="opIdAuthController_login"></a>

`POST /auth/login`

_Unified login (web + Telegram Mini App)_

Context-aware login endpoint that handles all three scenarios:

**1. TMA auto-login** — Send `initData` only. If the Telegram account is already linked to a CRM user, logs in immediately (no credentials needed).

**2. TMA first-time / credential bind** — Send `initData` + `email` + `password`. Authenticates and automatically binds the Telegram user ID to the account. Future opens auto-login via case 1.

**3. Web dashboard login** — Send `email` + `password` only. Regular credential auth.

**TELEGRAM_NOT_LINKED**: When `initData` is valid but no account is linked yet (and no credentials supplied), returns `401 { code: "TELEGRAM_NOT_LINKED" }`. FE should show the email+password form and re-submit.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "initData": {
      "type": "string",
      "description": "Telegram WebApp initData from window.Telegram.WebApp.initData. Present when running inside a Telegram Mini App. Send even if empty — backend auto-detects the context.",
      "example": "query_id=AAHd...&user=%7B%22id%22%3A123456789%7D&auth_date=1708768000&hash=abc123"
    },
    "email": {
      "type": "string",
      "example": "admin@crm.com",
      "description": "User email address. Required when initData is absent."
    },
    "password": {
      "type": "string",
      "example": "P@ssw0rd!",
      "minLength": 8,
      "description": "User password. Required when initData is absent."
    },
    "deviceId": {
      "type": "string",
      "example": "device-uuid-v4"
    },
    "userAgent": {
      "type": "string",
      "example": "Mozilla/5.0 ..."
    }
  }
}
```

<h3 id="authcontroller_login-parameters">Parameters</h3>

| Name        | In   | Type                        | Required | Description                                                                                                                                                            |
| ----------- | ---- | --------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| body        | body | [LoginDto](#schemalogindto) | true     | none                                                                                                                                                                   |
| » initData  | body | string                      | false    | Telegram WebApp initData from window.Telegram.WebApp.initData. Present when running inside a Telegram Mini App. Send even if empty — backend auto-detects the context. |
| » email     | body | string                      | false    | User email address. Required when initData is absent.                                                                                                                  |
| » password  | body | string                      | false    | User password. Required when initData is absent.                                                                                                                       |
| » deviceId  | body | string                      | false    | none                                                                                                                                                                   |
| » userAgent | body | string                      | false    | none                                                                                                                                                                   |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "accessToken": {
          "type": "string",
          "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "description": "Short-lived JWT access token (15 min). Send as Authorization: Bearer <token>"
        },
        "user": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
              "description": "User UUID"
            },
            "email": {
              "type": "string",
              "example": "superadmin@yopmail.com",
              "description": "User email address"
            },
            "role": {
              "type": "string",
              "example": "ADMIN",
              "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
              "description": "RBAC role"
            },
            "isActive": {
              "type": "boolean",
              "example": true,
              "description": "Whether this account is active and can log in"
            },
            "telegramId": {
              "type": "object",
              "example": "987654321",
              "nullable": true,
              "description": "Telegram user ID linked for TMA login. Null if not linked."
            },
            "lastLoginAt": {
              "type": "object",
              "example": "2026-02-24T08:30:00.000Z",
              "nullable": true,
              "description": "Timestamp of last successful login"
            },
            "lastIpAddress": {
              "type": "object",
              "example": "103.10.20.5",
              "nullable": true,
              "description": "IP address from the last login"
            },
            "createdAt": {
              "format": "date-time",
              "type": "string",
              "example": "2026-01-15T10:00:00.000Z",
              "description": "Account creation timestamp"
            },
            "updatedAt": {
              "format": "date-time",
              "type": "string",
              "example": "2026-02-24T08:30:00.000Z",
              "description": "Last profile update timestamp"
            }
          },
          "required": [
            "id",
            "email",
            "role",
            "isActive",
            "telegramId",
            "lastLoginAt",
            "lastIpAddress",
            "createdAt",
            "updatedAt"
          ]
        }
      },
      "required": ["accessToken", "user"]
    }
  }
}
```

<h3 id="authcontroller_login-responses">Responses</h3>

| Status | Meaning                                                                  | Description                                                                                           | Schema |
| ------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                  | Login successful                                                                                      | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)          | Unauthorized — invalid credentials, invalid initData, or TELEGRAM_NOT_LINKED (account not yet linked) | Inline |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed                                                                                     | None   |
| 429    | [Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)       | Too many requests – rate limit exceeded                                                               | None   |

<h3 id="authcontroller_login-responseschema">Response Schema</h3>

Status Code **200**

| Name              | Type                                      | Required | Restrictions | Description                                                                  |
| ----------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------------------------- |
| » statusCode      | number                                    | false    | none         | none                                                                         |
| » message         | string                                    | false    | none         | none                                                                         |
| » data            | [AuthResponseDto](#schemaauthresponsedto) | false    | none         | none                                                                         |
| »» accessToken    | string                                    | true     | none         | Short-lived JWT access token (15 min). Send as Authorization: Bearer <token> |
| »» user           | [UserResponseDto](#schemauserresponsedto) | true     | none         | none                                                                         |
| »»» id            | string                                    | true     | none         | User UUID                                                                    |
| »»» email         | string                                    | true     | none         | User email address                                                           |
| »»» role          | string                                    | true     | none         | RBAC role                                                                    |
| »»» isActive      | boolean                                   | true     | none         | Whether this account is active and can log in                                |
| »»» telegramId    | object¦null                               | true     | none         | Telegram user ID linked for TMA login. Null if not linked.                   |
| »»» lastLoginAt   | object¦null                               | true     | none         | Timestamp of last successful login                                           |
| »»» lastIpAddress | object¦null                               | true     | none         | IP address from the last login                                               |
| »»» createdAt     | string(date-time)                         | true     | none         | Account creation timestamp                                                   |
| »»» updatedAt     | string(date-time)                         | true     | none         | Last profile update timestamp                                                |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

Status Code **401**

| Name         | Type   | Required | Restrictions | Description                                                   |
| ------------ | ------ | -------- | ------------ | ------------------------------------------------------------- |
| » statusCode | number | false    | none         | none                                                          |
| » message    | string | false    | none         | none                                                          |
| » code       | string | false    | none         | Present only when initData is valid but account is not linked |

<aside class="success">
This operation does not require authentication
</aside>

## AuthController_refresh

<a id="opIdAuthController_refresh"></a>

`POST /auth/refresh`

_Refresh access token_

Reads the refresh_token HTTP-Only cookie and issues a new short-lived access token.

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "properties": {
        "accessToken": {
          "type": "string"
        }
      }
    }
  }
}
```

<h3 id="authcontroller_refresh-responses">Responses</h3>

| Status | Meaning                                                            | Description                             | Schema |
| ------ | ------------------------------------------------------------------ | --------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)            | Token refreshed                         | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)    | Unauthorized – invalid or missing JWT   | None   |
| 429    | [Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4) | Too many requests – rate limit exceeded | None   |

<h3 id="authcontroller_refresh-responseschema">Response Schema</h3>

Status Code **200**

| Name           | Type   | Required | Restrictions | Description |
| -------------- | ------ | -------- | ------------ | ----------- |
| » statusCode   | number | false    | none         | none        |
| » message      | string | false    | none         | none        |
| » data         | object | false    | none         | none        |
| »» accessToken | string | false    | none         | none        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
cookie
</aside>

## AuthController_logout

<a id="opIdAuthController_logout"></a>

`POST /auth/logout`

_Logout current session_

Revokes current session and clears the refresh cookie.

<h3 id="authcontroller_logout-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5) | Logged out successfully               | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## AuthController_setupAccount

<a id="opIdAuthController_setupAccount"></a>

`POST /auth/setup-account`

_Setup invited account_

Completes onboarding for an invited user: validates invitation token + Telegram initData, creates user, sets session.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "invitationToken": {
      "type": "string",
      "description": "Invitation token starting with inv_ received via Telegram deep link",
      "example": "inv_abc123"
    },
    "initData": {
      "type": "string",
      "description": "Telegram WebApp initData string from window.Telegram.WebApp.initData. Required when setup is done inside a Telegram Mini App. When the setup URL is opened in a regular browser after clicking the Telegram deep link, the telegramId is automatically retrieved from the server (recorded when you opened the invite link in Telegram).",
      "example": "query_id=AAHd...&user=%7B%22id%22%3A123456789%7D&auth_date=1708768000&hash=abc123"
    },
    "email": {
      "type": "string",
      "example": "newuser@crm.com",
      "description": "Email to set for this new account"
    },
    "password": {
      "type": "string",
      "example": "P@ssw0rd!",
      "minLength": 8,
      "description": "Password to set (min 8 characters)"
    },
    "deviceId": {
      "type": "string",
      "example": "device-uuid-v4",
      "description": "Unique device identifier for session tracking"
    },
    "userAgent": {
      "type": "string",
      "example": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
      "description": "Device user agent string"
    }
  },
  "required": ["invitationToken", "email", "password"]
}
```

<h3 id="authcontroller_setupaccount-parameters">Parameters</h3>

| Name              | In   | Type                                      | Required | Description                                                                                                                                                                                                                                                                                                                              |
| ----------------- | ---- | ----------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| body              | body | [SetupAccountDto](#schemasetupaccountdto) | true     | none                                                                                                                                                                                                                                                                                                                                     |
| » invitationToken | body | string                                    | true     | Invitation token starting with inv\_ received via Telegram deep link                                                                                                                                                                                                                                                                     |
| » initData        | body | string                                    | false    | Telegram WebApp initData string from window.Telegram.WebApp.initData. Required when setup is done inside a Telegram Mini App. When the setup URL is opened in a regular browser after clicking the Telegram deep link, the telegramId is automatically retrieved from the server (recorded when you opened the invite link in Telegram). |
| » email           | body | string                                    | true     | Email to set for this new account                                                                                                                                                                                                                                                                                                        |
| » password        | body | string                                    | true     | Password to set (min 8 characters)                                                                                                                                                                                                                                                                                                       |
| » deviceId        | body | string                                    | false    | Unique device identifier for session tracking                                                                                                                                                                                                                                                                                            |
| » userAgent       | body | string                                    | false    | Device user agent string                                                                                                                                                                                                                                                                                                                 |

> Example responses

> 201 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "accessToken": {
          "type": "string",
          "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "description": "Short-lived JWT access token (15 min). Send as Authorization: Bearer <token>"
        },
        "user": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
              "description": "User UUID"
            },
            "email": {
              "type": "string",
              "example": "superadmin@yopmail.com",
              "description": "User email address"
            },
            "role": {
              "type": "string",
              "example": "ADMIN",
              "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
              "description": "RBAC role"
            },
            "isActive": {
              "type": "boolean",
              "example": true,
              "description": "Whether this account is active and can log in"
            },
            "telegramId": {
              "type": "object",
              "example": "987654321",
              "nullable": true,
              "description": "Telegram user ID linked for TMA login. Null if not linked."
            },
            "lastLoginAt": {
              "type": "object",
              "example": "2026-02-24T08:30:00.000Z",
              "nullable": true,
              "description": "Timestamp of last successful login"
            },
            "lastIpAddress": {
              "type": "object",
              "example": "103.10.20.5",
              "nullable": true,
              "description": "IP address from the last login"
            },
            "createdAt": {
              "format": "date-time",
              "type": "string",
              "example": "2026-01-15T10:00:00.000Z",
              "description": "Account creation timestamp"
            },
            "updatedAt": {
              "format": "date-time",
              "type": "string",
              "example": "2026-02-24T08:30:00.000Z",
              "description": "Last profile update timestamp"
            }
          },
          "required": [
            "id",
            "email",
            "role",
            "isActive",
            "telegramId",
            "lastLoginAt",
            "lastIpAddress",
            "createdAt",
            "updatedAt"
          ]
        }
      },
      "required": ["accessToken", "user"]
    }
  }
}
```

<h3 id="authcontroller_setupaccount-responses">Responses</h3>

| Status | Meaning                                                                  | Description                             | Schema |
| ------ | ------------------------------------------------------------------------ | --------------------------------------- | ------ |
| 201    | [Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)             | Account created and logged in           | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)          | Unauthorized – invalid or missing JWT   | None   |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed                       | None   |
| 429    | [Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)       | Too many requests – rate limit exceeded | None   |

<h3 id="authcontroller_setupaccount-responseschema">Response Schema</h3>

Status Code **201**

| Name              | Type                                      | Required | Restrictions | Description                                                                  |
| ----------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------------------------- |
| » statusCode      | number                                    | false    | none         | none                                                                         |
| » message         | string                                    | false    | none         | none                                                                         |
| » data            | [AuthResponseDto](#schemaauthresponsedto) | false    | none         | none                                                                         |
| »» accessToken    | string                                    | true     | none         | Short-lived JWT access token (15 min). Send as Authorization: Bearer <token> |
| »» user           | [UserResponseDto](#schemauserresponsedto) | true     | none         | none                                                                         |
| »»» id            | string                                    | true     | none         | User UUID                                                                    |
| »»» email         | string                                    | true     | none         | User email address                                                           |
| »»» role          | string                                    | true     | none         | RBAC role                                                                    |
| »»» isActive      | boolean                                   | true     | none         | Whether this account is active and can log in                                |
| »»» telegramId    | object¦null                               | true     | none         | Telegram user ID linked for TMA login. Null if not linked.                   |
| »»» lastLoginAt   | object¦null                               | true     | none         | Timestamp of last successful login                                           |
| »»» lastIpAddress | object¦null                               | true     | none         | IP address from the last login                                               |
| »»» createdAt     | string(date-time)                         | true     | none         | Account creation timestamp                                                   |
| »»» updatedAt     | string(date-time)                         | true     | none         | Last profile update timestamp                                                |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="success">
This operation does not require authentication
</aside>

## AuthController_getSessions

<a id="opIdAuthController_getSessions"></a>

`GET /auth/sessions`

_List active sessions_

Returns all non-revoked, non-expired sessions for the authenticated user.

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "description": "Session UUID"
          },
          "deviceId": {
            "type": "object",
            "example": "device-uuid-v4",
            "nullable": true,
            "description": "Unique device identifier"
          },
          "userAgent": {
            "type": "object",
            "example": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
            "nullable": true,
            "description": "Browser/app user agent string"
          },
          "ipAddress": {
            "type": "object",
            "example": "103.10.20.5",
            "nullable": true,
            "description": "Last known IP address for this session"
          },
          "lastActiveAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-24T09:00:00.000Z",
            "description": "Timestamp of last API activity"
          },
          "createdAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-24T08:00:00.000Z",
            "description": "When this session was created"
          },
          "expiresAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-03-03T08:00:00.000Z",
            "description": "When the refresh token expires (7 days from creation)"
          },
          "isRevoked": {
            "type": "boolean",
            "example": false,
            "description": "True if this session has been manually revoked"
          }
        },
        "required": [
          "id",
          "deviceId",
          "userAgent",
          "ipAddress",
          "lastActiveAt",
          "createdAt",
          "expiresAt",
          "isRevoked"
        ]
      }
    }
  }
}
```

<h3 id="authcontroller_getsessions-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Sessions retrieved                    | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |

<h3 id="authcontroller_getsessions-responseschema">Response Schema</h3>

Status Code **200**

| Name            | Type                                              | Required | Restrictions | Description                                           |
| --------------- | ------------------------------------------------- | -------- | ------------ | ----------------------------------------------------- |
| » statusCode    | number                                            | false    | none         | none                                                  |
| » message       | string                                            | false    | none         | none                                                  |
| » data          | [[SessionResponseDto](#schemasessionresponsedto)] | false    | none         | none                                                  |
| »» id           | string                                            | true     | none         | Session UUID                                          |
| »» deviceId     | object¦null                                       | true     | none         | Unique device identifier                              |
| »» userAgent    | object¦null                                       | true     | none         | Browser/app user agent string                         |
| »» ipAddress    | object¦null                                       | true     | none         | Last known IP address for this session                |
| »» lastActiveAt | string(date-time)                                 | true     | none         | Timestamp of last API activity                        |
| »» createdAt    | string(date-time)                                 | true     | none         | When this session was created                         |
| »» expiresAt    | string(date-time)                                 | true     | none         | When the refresh token expires (7 days from creation) |
| »» isRevoked    | boolean                                           | true     | none         | True if this session has been manually revoked        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## AuthController_revokeAllSessions

<a id="opIdAuthController_revokeAllSessions"></a>

`DELETE /auth/sessions`

_Logout everywhere_

Revokes ALL sessions for the current user and clears the refresh cookie.

<h3 id="authcontroller_revokeallsessions-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5) | All sessions revoked                  | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## AuthController_revokeSession

<a id="opIdAuthController_revokeSession"></a>

`DELETE /auth/sessions/{sessionId}`

_Revoke a session_

Remote-wipe a specific session by UUID (sign out a device).

<h3 id="authcontroller_revokesession-parameters">Parameters</h3>

| Name      | In   | Type         | Required | Description          |
| --------- | ---- | ------------ | -------- | -------------------- |
| sessionId | path | string(uuid) | true     | Session ID to revoke |

<h3 id="authcontroller_revokesession-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5) | Session revoked                       | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | Resource not found                    | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## AuthController_forgotPassword

<a id="opIdAuthController_forgotPassword"></a>

`POST /auth/forgot-password`

_Request password reset_

Sends a 4-digit OTP to the provided email. Always returns 200 to prevent email enumeration. Rate-limited to 3 requests per 15 minutes.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "example": "admin@crm.com",
      "description": "Account email address"
    }
  },
  "required": ["email"]
}
```

<h3 id="authcontroller_forgotpassword-parameters">Parameters</h3>

| Name    | In   | Type                                          | Required | Description           |
| ------- | ---- | --------------------------------------------- | -------- | --------------------- |
| body    | body | [ForgotPasswordDto](#schemaforgotpassworddto) | true     | none                  |
| » email | body | string                                        | true     | Account email address |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "If this email is registered, a reset code has been sent"
    }
  }
}
```

<h3 id="authcontroller_forgotpassword-responses">Responses</h3>

| Status | Meaning                                                                  | Description                                       | Schema |
| ------ | ------------------------------------------------------------------------ | ------------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                  | OTP sent (or silently ignored if email not found) | Inline |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed                                 | None   |
| 429    | [Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)       | Too many requests – rate limit exceeded           | None   |

<h3 id="authcontroller_forgotpassword-responseschema">Response Schema</h3>

Status Code **200**

| Name         | Type   | Required | Restrictions | Description |
| ------------ | ------ | -------- | ------------ | ----------- |
| » statusCode | number | false    | none         | none        |
| » message    | string | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

## AuthController_resetPassword

<a id="opIdAuthController_resetPassword"></a>

`POST /auth/reset-password`

_Reset password with OTP_

Validates the 4-digit OTP and sets a new password. Max 3 failed attempts — the code is invalidated after 3 failures or on success.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "example": "admin@crm.com",
      "description": "Account email address"
    },
    "code": {
      "type": "string",
      "example": "4821",
      "description": "4-digit OTP sent to your email",
      "minLength": 4,
      "maxLength": 4
    },
    "newPassword": {
      "type": "string",
      "example": "N3wP@ssword!",
      "minLength": 8,
      "description": "New password (min 8 characters)"
    }
  },
  "required": ["email", "code", "newPassword"]
}
```

<h3 id="authcontroller_resetpassword-parameters">Parameters</h3>

| Name          | In   | Type                                        | Required | Description                     |
| ------------- | ---- | ------------------------------------------- | -------- | ------------------------------- |
| body          | body | [ResetPasswordDto](#schemaresetpassworddto) | true     | none                            |
| » email       | body | string                                      | true     | Account email address           |
| » code        | body | string                                      | true     | 4-digit OTP sent to your email  |
| » newPassword | body | string                                      | true     | New password (min 8 characters) |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Password has been reset. Please log in."
    }
  }
}
```

<h3 id="authcontroller_resetpassword-responses">Responses</h3>

| Status | Meaning                                                                  | Description                                            | Schema |
| ------ | ------------------------------------------------------------------------ | ------------------------------------------------------ | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                  | Password reset successfully                            | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)         | Bad request – invalid input or business rule violation | None   |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed                                      | None   |
| 429    | [Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)       | Too many requests – rate limit exceeded                | None   |

<h3 id="authcontroller_resetpassword-responseschema">Response Schema</h3>

Status Code **200**

| Name         | Type   | Required | Restrictions | Description |
| ------------ | ------ | -------- | ------------ | ----------- |
| » statusCode | number | false    | none         | none        |
| » message    | string | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

## AuthController_changeOwnPassword

<a id="opIdAuthController_changeOwnPassword"></a>

`PATCH /auth/change-own-password`

_Change own password_

Authenticated users can change their own password by providing their current password. All sessions are revoked on success.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "currentPassword": {
      "type": "string",
      "description": "Your current password",
      "example": "P@ssw0rd!"
    },
    "newPassword": {
      "type": "string",
      "example": "N3wP@ssword!",
      "minLength": 8,
      "description": "New password (min 8 characters)"
    },
    "confirmPassword": {
      "type": "string",
      "description": "Repeat new password — must match newPassword",
      "example": "N3wP@ssword!"
    }
  },
  "required": ["currentPassword", "newPassword", "confirmPassword"]
}
```

<h3 id="authcontroller_changeownpassword-parameters">Parameters</h3>

| Name              | In   | Type                                                | Required | Description                                  |
| ----------------- | ---- | --------------------------------------------------- | -------- | -------------------------------------------- |
| body              | body | [ChangeOwnPasswordDto](#schemachangeownpassworddto) | true     | none                                         |
| » currentPassword | body | string                                              | true     | Your current password                        |
| » newPassword     | body | string                                              | true     | New password (min 8 characters)              |
| » confirmPassword | body | string                                              | true     | Repeat new password — must match newPassword |

<h3 id="authcontroller_changeownpassword-responses">Responses</h3>

| Status | Meaning                                                            | Description                                            | Schema |
| ------ | ------------------------------------------------------------------ | ------------------------------------------------------ | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)    | Password changed — all sessions revoked                | None   |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)   | Bad request – invalid input or business rule violation | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)    | Unauthorized – invalid or missing JWT                  | None   |
| 429    | [Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4) | Too many requests – rate limit exceeded                | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="titan-journal-crm-api-users">users</h1>

## UsersController_findAll

<a id="opIdUsersController_findAll"></a>

`GET /users`

_List all users_

Returns all CRM system users. Requires ADMIN role or higher.

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "description": "User UUID"
          },
          "email": {
            "type": "string",
            "example": "superadmin@yopmail.com",
            "description": "User email address"
          },
          "role": {
            "type": "string",
            "example": "ADMIN",
            "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
            "description": "RBAC role"
          },
          "isActive": {
            "type": "boolean",
            "example": true,
            "description": "Whether this account is active and can log in"
          },
          "telegramId": {
            "type": "object",
            "example": "987654321",
            "nullable": true,
            "description": "Telegram user ID linked for TMA login. Null if not linked."
          },
          "lastLoginAt": {
            "type": "object",
            "example": "2026-02-24T08:30:00.000Z",
            "nullable": true,
            "description": "Timestamp of last successful login"
          },
          "lastIpAddress": {
            "type": "object",
            "example": "103.10.20.5",
            "nullable": true,
            "description": "IP address from the last login"
          },
          "createdAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-01-15T10:00:00.000Z",
            "description": "Account creation timestamp"
          },
          "updatedAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-24T08:30:00.000Z",
            "description": "Last profile update timestamp"
          }
        },
        "required": [
          "id",
          "email",
          "role",
          "isActive",
          "telegramId",
          "lastLoginAt",
          "lastIpAddress",
          "createdAt",
          "updatedAt"
        ]
      }
    }
  }
}
```

<h3 id="userscontroller_findall-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Users retrieved                       | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="userscontroller_findall-responseschema">Response Schema</h3>

Status Code **200**

| Name             | Type                                        | Required | Restrictions | Description                                                |
| ---------------- | ------------------------------------------- | -------- | ------------ | ---------------------------------------------------------- |
| » statusCode     | number                                      | false    | none         | none                                                       |
| » message        | string                                      | false    | none         | none                                                       |
| » data           | [[UserResponseDto](#schemauserresponsedto)] | false    | none         | none                                                       |
| »» id            | string                                      | true     | none         | User UUID                                                  |
| »» email         | string                                      | true     | none         | User email address                                         |
| »» role          | string                                      | true     | none         | RBAC role                                                  |
| »» isActive      | boolean                                     | true     | none         | Whether this account is active and can log in              |
| »» telegramId    | object¦null                                 | true     | none         | Telegram user ID linked for TMA login. Null if not linked. |
| »» lastLoginAt   | object¦null                                 | true     | none         | Timestamp of last successful login                         |
| »» lastIpAddress | object¦null                                 | true     | none         | IP address from the last login                             |
| »» createdAt     | string(date-time)                           | true     | none         | Account creation timestamp                                 |
| »» updatedAt     | string(date-time)                           | true     | none         | Last profile update timestamp                              |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## UsersController_getMe

<a id="opIdUsersController_getMe"></a>

`GET /users/me`

_Get own profile_

Returns the authenticated user's profile.

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "User UUID"
        },
        "email": {
          "type": "string",
          "example": "superadmin@yopmail.com",
          "description": "User email address"
        },
        "role": {
          "type": "string",
          "example": "ADMIN",
          "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
          "description": "RBAC role"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Whether this account is active and can log in"
        },
        "telegramId": {
          "type": "object",
          "example": "987654321",
          "nullable": true,
          "description": "Telegram user ID linked for TMA login. Null if not linked."
        },
        "lastLoginAt": {
          "type": "object",
          "example": "2026-02-24T08:30:00.000Z",
          "nullable": true,
          "description": "Timestamp of last successful login"
        },
        "lastIpAddress": {
          "type": "object",
          "example": "103.10.20.5",
          "nullable": true,
          "description": "IP address from the last login"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-01-15T10:00:00.000Z",
          "description": "Account creation timestamp"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:30:00.000Z",
          "description": "Last profile update timestamp"
        }
      },
      "required": [
        "id",
        "email",
        "role",
        "isActive",
        "telegramId",
        "lastLoginAt",
        "lastIpAddress",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="userscontroller_getme-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Profile retrieved                     | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |

<h3 id="userscontroller_getme-responseschema">Response Schema</h3>

Status Code **200**

| Name             | Type                                      | Required | Restrictions | Description                                                |
| ---------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------- |
| » statusCode     | number                                    | false    | none         | none                                                       |
| » message        | string                                    | false    | none         | none                                                       |
| » data           | [UserResponseDto](#schemauserresponsedto) | false    | none         | none                                                       |
| »» id            | string                                    | true     | none         | User UUID                                                  |
| »» email         | string                                    | true     | none         | User email address                                         |
| »» role          | string                                    | true     | none         | RBAC role                                                  |
| »» isActive      | boolean                                   | true     | none         | Whether this account is active and can log in              |
| »» telegramId    | object¦null                               | true     | none         | Telegram user ID linked for TMA login. Null if not linked. |
| »» lastLoginAt   | object¦null                               | true     | none         | Timestamp of last successful login                         |
| »» lastIpAddress | object¦null                               | true     | none         | IP address from the last login                             |
| »» createdAt     | string(date-time)                         | true     | none         | Account creation timestamp                                 |
| »» updatedAt     | string(date-time)                         | true     | none         | Last profile update timestamp                              |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## UsersController_listInvitations

<a id="opIdUsersController_listInvitations"></a>

`GET /users/invitations`

_List invitations_

Returns all pending and accepted invitations.

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "description": "Invitation UUID"
          },
          "role": {
            "type": "string",
            "example": "STAFF",
            "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
            "description": "Role that will be assigned upon account setup"
          },
          "email": {
            "type": "object",
            "example": "newstaff@crm.com",
            "nullable": true,
            "description": "Pre-filled email (if provided during invite creation)"
          },
          "telegramDeepLink": {
            "type": "string",
            "example": "https://t.me/YourBot?start=inv_abc123",
            "description": "Telegram deep link the invited user must open. Embeds the invitation token."
          },
          "expiresAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-31T10:00:00.000Z",
            "description": "Invitation expires 7 days after creation. Invalid after this timestamp."
          },
          "createdAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-24T10:00:00.000Z"
          }
        },
        "required": [
          "id",
          "role",
          "email",
          "telegramDeepLink",
          "expiresAt",
          "createdAt"
        ]
      }
    }
  }
}
```

<h3 id="userscontroller_listinvitations-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Invitations retrieved                 | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="userscontroller_listinvitations-responseschema">Response Schema</h3>

Status Code **200**

| Name                | Type                                                    | Required | Restrictions | Description                                                                 |
| ------------------- | ------------------------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------- |
| » statusCode        | number                                                  | false    | none         | none                                                                        |
| » message           | string                                                  | false    | none         | none                                                                        |
| » data              | [[InvitationResponseDto](#schemainvitationresponsedto)] | false    | none         | none                                                                        |
| »» id               | string                                                  | true     | none         | Invitation UUID                                                             |
| »» role             | string                                                  | true     | none         | Role that will be assigned upon account setup                               |
| »» email            | object¦null                                             | true     | none         | Pre-filled email (if provided during invite creation)                       |
| »» telegramDeepLink | string                                                  | true     | none         | Telegram deep link the invited user must open. Embeds the invitation token. |
| »» expiresAt        | string(date-time)                                       | true     | none         | Invitation expires 7 days after creation. Invalid after this timestamp.     |
| »» createdAt        | string(date-time)                                       | true     | none         | none                                                                        |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## UsersController_findById

<a id="opIdUsersController_findById"></a>

`GET /users/{id}`

_Get user by ID_

<h3 id="userscontroller_findbyid-parameters">Parameters</h3>

| Name | In   | Type         | Required | Description |
| ---- | ---- | ------------ | -------- | ----------- |
| id   | path | string(uuid) | true     | User UUID   |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "User UUID"
        },
        "email": {
          "type": "string",
          "example": "superadmin@yopmail.com",
          "description": "User email address"
        },
        "role": {
          "type": "string",
          "example": "ADMIN",
          "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
          "description": "RBAC role"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Whether this account is active and can log in"
        },
        "telegramId": {
          "type": "object",
          "example": "987654321",
          "nullable": true,
          "description": "Telegram user ID linked for TMA login. Null if not linked."
        },
        "lastLoginAt": {
          "type": "object",
          "example": "2026-02-24T08:30:00.000Z",
          "nullable": true,
          "description": "Timestamp of last successful login"
        },
        "lastIpAddress": {
          "type": "object",
          "example": "103.10.20.5",
          "nullable": true,
          "description": "IP address from the last login"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-01-15T10:00:00.000Z",
          "description": "Account creation timestamp"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:30:00.000Z",
          "description": "Last profile update timestamp"
        }
      },
      "required": [
        "id",
        "email",
        "role",
        "isActive",
        "telegramId",
        "lastLoginAt",
        "lastIpAddress",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="userscontroller_findbyid-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | User retrieved                        | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | Resource not found                    | None   |

<h3 id="userscontroller_findbyid-responseschema">Response Schema</h3>

Status Code **200**

| Name             | Type                                      | Required | Restrictions | Description                                                |
| ---------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------- |
| » statusCode     | number                                    | false    | none         | none                                                       |
| » message        | string                                    | false    | none         | none                                                       |
| » data           | [UserResponseDto](#schemauserresponsedto) | false    | none         | none                                                       |
| »» id            | string                                    | true     | none         | User UUID                                                  |
| »» email         | string                                    | true     | none         | User email address                                         |
| »» role          | string                                    | true     | none         | RBAC role                                                  |
| »» isActive      | boolean                                   | true     | none         | Whether this account is active and can log in              |
| »» telegramId    | object¦null                               | true     | none         | Telegram user ID linked for TMA login. Null if not linked. |
| »» lastLoginAt   | object¦null                               | true     | none         | Timestamp of last successful login                         |
| »» lastIpAddress | object¦null                               | true     | none         | IP address from the last login                             |
| »» createdAt     | string(date-time)                         | true     | none         | Account creation timestamp                                 |
| »» updatedAt     | string(date-time)                         | true     | none         | Last profile update timestamp                              |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## UsersController_deactivate

<a id="opIdUsersController_deactivate"></a>

`PATCH /users/{id}/deactivate`

_Deactivate user_

Deactivates the user and instantly revokes all their sessions (SUPERADMIN only).

<h3 id="userscontroller_deactivate-parameters">Parameters</h3>

| Name | In   | Type         | Required | Description |
| ---- | ---- | ------------ | -------- | ----------- |
| id   | path | string(uuid) | true     | User UUID   |

<h3 id="userscontroller_deactivate-responses">Responses</h3>

| Status | Meaning                                                         | Description                               | Schema |
| ------ | --------------------------------------------------------------- | ----------------------------------------- | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5) | User deactivated and all sessions revoked | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT     | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role             | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | Resource not found                        | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## UsersController_changePassword

<a id="opIdUsersController_changePassword"></a>

`PATCH /users/{id}/change-password`

_Force password change_

Resets a user's password and revokes all their sessions (SUPERADMIN only).

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "newPassword": {
      "type": "string"
    }
  },
  "required": ["newPassword"]
}
```

<h3 id="userscontroller_changepassword-parameters">Parameters</h3>

| Name          | In   | Type                                          | Required | Description |
| ------------- | ---- | --------------------------------------------- | -------- | ----------- |
| id            | path | string(uuid)                                  | true     | User UUID   |
| body          | body | [ChangePasswordDto](#schemachangepassworddto) | true     | none        |
| » newPassword | body | string                                        | true     | none        |

<h3 id="userscontroller_changepassword-responses">Responses</h3>

| Status | Meaning                                                                  | Description                               | Schema |
| ------ | ------------------------------------------------------------------------ | ----------------------------------------- | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)          | Password changed and all sessions revoked | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)          | Unauthorized – invalid or missing JWT     | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)           | Forbidden – insufficient role             | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)           | Resource not found                        | None   |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed                         | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## UsersController_invite

<a id="opIdUsersController_invite"></a>

`POST /users/invite`

_Invite a team member_

Creates an invitation with a Telegram deep link for onboarding a new CRM user.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "role": {
      "type": "string",
      "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
      "example": "STAFF",
      "description": "Role to assign to the invited user"
    },
    "email": {
      "type": "string",
      "example": "newstaff@crm.com",
      "description": "Pre-fill email for the invited user (optional). They can set it during setup."
    }
  },
  "required": ["role"]
}
```

<h3 id="userscontroller_invite-parameters">Parameters</h3>

| Name    | In   | Type                                  | Required | Description                                                                   |
| ------- | ---- | ------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| body    | body | [InviteUserDto](#schemainviteuserdto) | true     | none                                                                          |
| » role  | body | string                                | true     | Role to assign to the invited user                                            |
| » email | body | string                                | false    | Pre-fill email for the invited user (optional). They can set it during setup. |

#### Enumerated Values

| Parameter | Value      |
| --------- | ---------- |
| » role    | SUPERADMIN |
| » role    | OWNER      |
| » role    | ADMIN      |
| » role    | STAFF      |

> Example responses

> 201 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "Invitation UUID"
        },
        "role": {
          "type": "string",
          "example": "STAFF",
          "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
          "description": "Role that will be assigned upon account setup"
        },
        "email": {
          "type": "object",
          "example": "newstaff@crm.com",
          "nullable": true,
          "description": "Pre-filled email (if provided during invite creation)"
        },
        "telegramDeepLink": {
          "type": "string",
          "example": "https://t.me/YourBot?start=inv_abc123",
          "description": "Telegram deep link the invited user must open. Embeds the invitation token."
        },
        "expiresAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-31T10:00:00.000Z",
          "description": "Invitation expires 7 days after creation. Invalid after this timestamp."
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T10:00:00.000Z"
        }
      },
      "required": [
        "id",
        "role",
        "email",
        "telegramDeepLink",
        "expiresAt",
        "createdAt"
      ]
    }
  }
}
```

<h3 id="userscontroller_invite-responses">Responses</h3>

| Status | Meaning                                                                  | Description                           | Schema |
| ------ | ------------------------------------------------------------------------ | ------------------------------------- | ------ |
| 201    | [Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)             | Invitation created                    | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)          | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)           | Forbidden – insufficient role         | None   |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed                     | None   |

<h3 id="userscontroller_invite-responseschema">Response Schema</h3>

Status Code **201**

| Name                | Type                                                  | Required | Restrictions | Description                                                                 |
| ------------------- | ----------------------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------- |
| » statusCode        | number                                                | false    | none         | none                                                                        |
| » message           | string                                                | false    | none         | none                                                                        |
| » data              | [InvitationResponseDto](#schemainvitationresponsedto) | false    | none         | none                                                                        |
| »» id               | string                                                | true     | none         | Invitation UUID                                                             |
| »» role             | string                                                | true     | none         | Role that will be assigned upon account setup                               |
| »» email            | object¦null                                           | true     | none         | Pre-filled email (if provided during invite creation)                       |
| »» telegramDeepLink | string                                                | true     | none         | Telegram deep link the invited user must open. Embeds the invitation token. |
| »» expiresAt        | string(date-time)                                     | true     | none         | Invitation expires 7 days after creation. Invalid after this timestamp.     |
| »» createdAt        | string(date-time)                                     | true     | none         | none                                                                        |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## UsersController_deleteInvitation

<a id="opIdUsersController_deleteInvitation"></a>

`DELETE /users/invitations/{id}`

_Delete invitation_

Permanently deletes an unused invitation.

<h3 id="userscontroller_deleteinvitation-parameters">Parameters</h3>

| Name | In   | Type         | Required | Description     |
| ---- | ---- | ------------ | -------- | --------------- |
| id   | path | string(uuid) | true     | Invitation UUID |

<h3 id="userscontroller_deleteinvitation-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5) | Invitation deleted                    | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | Resource not found                    | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## UsersController_reactivate

<a id="opIdUsersController_reactivate"></a>

`PATCH /users/{id}/reactivate`

_Reactivate user_

Re-enables a deactivated user and clears their Redis block, restoring access (SUPERADMIN only).

<h3 id="userscontroller_reactivate-parameters">Parameters</h3>

| Name | In   | Type         | Required | Description |
| ---- | ---- | ------------ | -------- | ----------- |
| id   | path | string(uuid) | true     | User UUID   |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "User UUID"
        },
        "email": {
          "type": "string",
          "example": "superadmin@yopmail.com",
          "description": "User email address"
        },
        "role": {
          "type": "string",
          "example": "ADMIN",
          "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
          "description": "RBAC role"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Whether this account is active and can log in"
        },
        "telegramId": {
          "type": "object",
          "example": "987654321",
          "nullable": true,
          "description": "Telegram user ID linked for TMA login. Null if not linked."
        },
        "lastLoginAt": {
          "type": "object",
          "example": "2026-02-24T08:30:00.000Z",
          "nullable": true,
          "description": "Timestamp of last successful login"
        },
        "lastIpAddress": {
          "type": "object",
          "example": "103.10.20.5",
          "nullable": true,
          "description": "IP address from the last login"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-01-15T10:00:00.000Z",
          "description": "Account creation timestamp"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:30:00.000Z",
          "description": "Last profile update timestamp"
        }
      },
      "required": [
        "id",
        "email",
        "role",
        "isActive",
        "telegramId",
        "lastLoginAt",
        "lastIpAddress",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="userscontroller_reactivate-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | User reactivated                      | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | Resource not found                    | None   |

<h3 id="userscontroller_reactivate-responseschema">Response Schema</h3>

Status Code **200**

| Name             | Type                                      | Required | Restrictions | Description                                                |
| ---------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------- |
| » statusCode     | number                                    | false    | none         | none                                                       |
| » message        | string                                    | false    | none         | none                                                       |
| » data           | [UserResponseDto](#schemauserresponsedto) | false    | none         | none                                                       |
| »» id            | string                                    | true     | none         | User UUID                                                  |
| »» email         | string                                    | true     | none         | User email address                                         |
| »» role          | string                                    | true     | none         | RBAC role                                                  |
| »» isActive      | boolean                                   | true     | none         | Whether this account is active and can log in              |
| »» telegramId    | object¦null                               | true     | none         | Telegram user ID linked for TMA login. Null if not linked. |
| »» lastLoginAt   | object¦null                               | true     | none         | Timestamp of last successful login                         |
| »» lastIpAddress | object¦null                               | true     | none         | IP address from the last login                             |
| »» createdAt     | string(date-time)                         | true     | none         | Account creation timestamp                                 |
| »» updatedAt     | string(date-time)                         | true     | none         | Last profile update timestamp                              |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## UsersController_changeRole

<a id="opIdUsersController_changeRole"></a>

`PATCH /users/{id}/role`

_Change user role_

Updates a user's role. Cannot change own role (SUPERADMIN only).

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "role": {
      "type": "string",
      "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
      "example": "ADMIN",
      "description": "New role to assign to the user"
    }
  },
  "required": ["role"]
}
```

<h3 id="userscontroller_changerole-parameters">Parameters</h3>

| Name   | In   | Type                                  | Required | Description                    |
| ------ | ---- | ------------------------------------- | -------- | ------------------------------ |
| id     | path | string(uuid)                          | true     | User UUID                      |
| body   | body | [ChangeRoleDto](#schemachangeroledto) | true     | none                           |
| » role | body | string                                | true     | New role to assign to the user |

#### Enumerated Values

| Parameter | Value      |
| --------- | ---------- |
| » role    | SUPERADMIN |
| » role    | OWNER      |
| » role    | ADMIN      |
| » role    | STAFF      |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "User UUID"
        },
        "email": {
          "type": "string",
          "example": "superadmin@yopmail.com",
          "description": "User email address"
        },
        "role": {
          "type": "string",
          "example": "ADMIN",
          "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
          "description": "RBAC role"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Whether this account is active and can log in"
        },
        "telegramId": {
          "type": "object",
          "example": "987654321",
          "nullable": true,
          "description": "Telegram user ID linked for TMA login. Null if not linked."
        },
        "lastLoginAt": {
          "type": "object",
          "example": "2026-02-24T08:30:00.000Z",
          "nullable": true,
          "description": "Timestamp of last successful login"
        },
        "lastIpAddress": {
          "type": "object",
          "example": "103.10.20.5",
          "nullable": true,
          "description": "IP address from the last login"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-01-15T10:00:00.000Z",
          "description": "Account creation timestamp"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:30:00.000Z",
          "description": "Last profile update timestamp"
        }
      },
      "required": [
        "id",
        "email",
        "role",
        "isActive",
        "telegramId",
        "lastLoginAt",
        "lastIpAddress",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="userscontroller_changerole-responses">Responses</h3>

| Status | Meaning                                                          | Description                                            | Schema |
| ------ | ---------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Role updated                                           | Inline |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Bad request – invalid input or business rule violation | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Unauthorized – invalid or missing JWT                  | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)   | Forbidden – insufficient role                          | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)   | Resource not found                                     | None   |

<h3 id="userscontroller_changerole-responseschema">Response Schema</h3>

Status Code **200**

| Name             | Type                                      | Required | Restrictions | Description                                                |
| ---------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------- |
| » statusCode     | number                                    | false    | none         | none                                                       |
| » message        | string                                    | false    | none         | none                                                       |
| » data           | [UserResponseDto](#schemauserresponsedto) | false    | none         | none                                                       |
| »» id            | string                                    | true     | none         | User UUID                                                  |
| »» email         | string                                    | true     | none         | User email address                                         |
| »» role          | string                                    | true     | none         | RBAC role                                                  |
| »» isActive      | boolean                                   | true     | none         | Whether this account is active and can log in              |
| »» telegramId    | object¦null                               | true     | none         | Telegram user ID linked for TMA login. Null if not linked. |
| »» lastLoginAt   | object¦null                               | true     | none         | Timestamp of last successful login                         |
| »» lastIpAddress | object¦null                               | true     | none         | IP address from the last login                             |
| »» createdAt     | string(date-time)                         | true     | none         | Account creation timestamp                                 |
| »» updatedAt     | string(date-time)                         | true     | none         | Last profile update timestamp                              |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="titan-journal-crm-api-superadmin">superadmin</h1>

## SuperadminUsersController_createUser

<a id="opIdSuperadminUsersController_createUser"></a>

`POST /superadmin/users`

_Create system user_

Directly creates a CRM user without an invitation (SUPERADMIN only).

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "example": "staff@crm.com",
      "description": "Email address for login"
    },
    "password": {
      "type": "string",
      "example": "P@ssw0rd!",
      "minLength": 8,
      "description": "Initial password (min 8 characters)"
    },
    "role": {
      "type": "string",
      "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
      "example": "STAFF",
      "description": "RBAC role to assign to this user"
    }
  },
  "required": ["email", "password", "role"]
}
```

<h3 id="superadminuserscontroller_createuser-parameters">Parameters</h3>

| Name       | In   | Type                                  | Required | Description                         |
| ---------- | ---- | ------------------------------------- | -------- | ----------------------------------- |
| body       | body | [CreateUserDto](#schemacreateuserdto) | true     | none                                |
| » email    | body | string                                | true     | Email address for login             |
| » password | body | string                                | true     | Initial password (min 8 characters) |
| » role     | body | string                                | true     | RBAC role to assign to this user    |

#### Enumerated Values

| Parameter | Value      |
| --------- | ---------- |
| » role    | SUPERADMIN |
| » role    | OWNER      |
| » role    | ADMIN      |
| » role    | STAFF      |

> Example responses

> 201 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "User UUID"
        },
        "email": {
          "type": "string",
          "example": "superadmin@yopmail.com",
          "description": "User email address"
        },
        "role": {
          "type": "string",
          "example": "ADMIN",
          "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
          "description": "RBAC role"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Whether this account is active and can log in"
        },
        "telegramId": {
          "type": "object",
          "example": "987654321",
          "nullable": true,
          "description": "Telegram user ID linked for TMA login. Null if not linked."
        },
        "lastLoginAt": {
          "type": "object",
          "example": "2026-02-24T08:30:00.000Z",
          "nullable": true,
          "description": "Timestamp of last successful login"
        },
        "lastIpAddress": {
          "type": "object",
          "example": "103.10.20.5",
          "nullable": true,
          "description": "IP address from the last login"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-01-15T10:00:00.000Z",
          "description": "Account creation timestamp"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:30:00.000Z",
          "description": "Last profile update timestamp"
        }
      },
      "required": [
        "id",
        "email",
        "role",
        "isActive",
        "telegramId",
        "lastLoginAt",
        "lastIpAddress",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="superadminuserscontroller_createuser-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 201    | [Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)    | User created successfully             | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="superadminuserscontroller_createuser-responseschema">Response Schema</h3>

Status Code **201**

| Name             | Type                                      | Required | Restrictions | Description                                                |
| ---------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------- |
| » statusCode     | number                                    | false    | none         | none                                                       |
| » message        | string                                    | false    | none         | none                                                       |
| » data           | [UserResponseDto](#schemauserresponsedto) | false    | none         | none                                                       |
| »» id            | string                                    | true     | none         | User UUID                                                  |
| »» email         | string                                    | true     | none         | User email address                                         |
| »» role          | string                                    | true     | none         | RBAC role                                                  |
| »» isActive      | boolean                                   | true     | none         | Whether this account is active and can log in              |
| »» telegramId    | object¦null                               | true     | none         | Telegram user ID linked for TMA login. Null if not linked. |
| »» lastLoginAt   | object¦null                               | true     | none         | Timestamp of last successful login                         |
| »» lastIpAddress | object¦null                               | true     | none         | IP address from the last login                             |
| »» createdAt     | string(date-time)                         | true     | none         | Account creation timestamp                                 |
| »» updatedAt     | string(date-time)                         | true     | none         | Last profile update timestamp                              |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## SuperadminUsersController_findAllUsers

<a id="opIdSuperadminUsersController_findAllUsers"></a>

`GET /superadmin/users`

_List all users_

Returns all CRM system users. Requires SUPERADMIN role.

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "description": "User UUID"
          },
          "email": {
            "type": "string",
            "example": "superadmin@yopmail.com",
            "description": "User email address"
          },
          "role": {
            "type": "string",
            "example": "ADMIN",
            "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
            "description": "RBAC role"
          },
          "isActive": {
            "type": "boolean",
            "example": true,
            "description": "Whether this account is active and can log in"
          },
          "telegramId": {
            "type": "object",
            "example": "987654321",
            "nullable": true,
            "description": "Telegram user ID linked for TMA login. Null if not linked."
          },
          "lastLoginAt": {
            "type": "object",
            "example": "2026-02-24T08:30:00.000Z",
            "nullable": true,
            "description": "Timestamp of last successful login"
          },
          "lastIpAddress": {
            "type": "object",
            "example": "103.10.20.5",
            "nullable": true,
            "description": "IP address from the last login"
          },
          "createdAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-01-15T10:00:00.000Z",
            "description": "Account creation timestamp"
          },
          "updatedAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-24T08:30:00.000Z",
            "description": "Last profile update timestamp"
          }
        },
        "required": [
          "id",
          "email",
          "role",
          "isActive",
          "telegramId",
          "lastLoginAt",
          "lastIpAddress",
          "createdAt",
          "updatedAt"
        ]
      }
    }
  }
}
```

<h3 id="superadminuserscontroller_findallusers-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Users retrieved                       | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="superadminuserscontroller_findallusers-responseschema">Response Schema</h3>

Status Code **200**

| Name             | Type                                        | Required | Restrictions | Description                                                |
| ---------------- | ------------------------------------------- | -------- | ------------ | ---------------------------------------------------------- |
| » statusCode     | number                                      | false    | none         | none                                                       |
| » message        | string                                      | false    | none         | none                                                       |
| » data           | [[UserResponseDto](#schemauserresponsedto)] | false    | none         | none                                                       |
| »» id            | string                                      | true     | none         | User UUID                                                  |
| »» email         | string                                      | true     | none         | User email address                                         |
| »» role          | string                                      | true     | none         | RBAC role                                                  |
| »» isActive      | boolean                                     | true     | none         | Whether this account is active and can log in              |
| »» telegramId    | object¦null                                 | true     | none         | Telegram user ID linked for TMA login. Null if not linked. |
| »» lastLoginAt   | object¦null                                 | true     | none         | Timestamp of last successful login                         |
| »» lastIpAddress | object¦null                                 | true     | none         | IP address from the last login                             |
| »» createdAt     | string(date-time)                           | true     | none         | Account creation timestamp                                 |
| »» updatedAt     | string(date-time)                           | true     | none         | Last profile update timestamp                              |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## SuperadminUsersController_findUserById

<a id="opIdSuperadminUsersController_findUserById"></a>

`GET /superadmin/users/{id}`

_Get user by ID_

Returns a specific user by UUID (SUPERADMIN only).

<h3 id="superadminuserscontroller_finduserbyid-parameters">Parameters</h3>

| Name | In   | Type         | Required | Description |
| ---- | ---- | ------------ | -------- | ----------- |
| id   | path | string(uuid) | true     | User UUID   |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "User UUID"
        },
        "email": {
          "type": "string",
          "example": "superadmin@yopmail.com",
          "description": "User email address"
        },
        "role": {
          "type": "string",
          "example": "ADMIN",
          "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
          "description": "RBAC role"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Whether this account is active and can log in"
        },
        "telegramId": {
          "type": "object",
          "example": "987654321",
          "nullable": true,
          "description": "Telegram user ID linked for TMA login. Null if not linked."
        },
        "lastLoginAt": {
          "type": "object",
          "example": "2026-02-24T08:30:00.000Z",
          "nullable": true,
          "description": "Timestamp of last successful login"
        },
        "lastIpAddress": {
          "type": "object",
          "example": "103.10.20.5",
          "nullable": true,
          "description": "IP address from the last login"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-01-15T10:00:00.000Z",
          "description": "Account creation timestamp"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:30:00.000Z",
          "description": "Last profile update timestamp"
        }
      },
      "required": [
        "id",
        "email",
        "role",
        "isActive",
        "telegramId",
        "lastLoginAt",
        "lastIpAddress",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="superadminuserscontroller_finduserbyid-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | User retrieved                        | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="superadminuserscontroller_finduserbyid-responseschema">Response Schema</h3>

Status Code **200**

| Name             | Type                                      | Required | Restrictions | Description                                                |
| ---------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------- |
| » statusCode     | number                                    | false    | none         | none                                                       |
| » message        | string                                    | false    | none         | none                                                       |
| » data           | [UserResponseDto](#schemauserresponsedto) | false    | none         | none                                                       |
| »» id            | string                                    | true     | none         | User UUID                                                  |
| »» email         | string                                    | true     | none         | User email address                                         |
| »» role          | string                                    | true     | none         | RBAC role                                                  |
| »» isActive      | boolean                                   | true     | none         | Whether this account is active and can log in              |
| »» telegramId    | object¦null                               | true     | none         | Telegram user ID linked for TMA login. Null if not linked. |
| »» lastLoginAt   | object¦null                               | true     | none         | Timestamp of last successful login                         |
| »» lastIpAddress | object¦null                               | true     | none         | IP address from the last login                             |
| »» createdAt     | string(date-time)                         | true     | none         | Account creation timestamp                                 |
| »» updatedAt     | string(date-time)                         | true     | none         | Last profile update timestamp                              |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## SuperadminUsersController_deactivateUser

<a id="opIdSuperadminUsersController_deactivateUser"></a>

`DELETE /superadmin/users/{id}`

_Deactivate user_

Deactivates the user and instantly revokes all their sessions (SUPERADMIN only).

<h3 id="superadminuserscontroller_deactivateuser-parameters">Parameters</h3>

| Name | In   | Type         | Required | Description |
| ---- | ---- | ------------ | -------- | ----------- |
| id   | path | string(uuid) | true     | User UUID   |

<h3 id="superadminuserscontroller_deactivateuser-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5) | User deactivated successfully         | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## SuperadminUsersController_forcePasswordChange

<a id="opIdSuperadminUsersController_forcePasswordChange"></a>

`PATCH /superadmin/users/{id}/change-password`

_Force password change_

Resets a user's password and revokes all their sessions (SUPERADMIN only).

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "newPassword": {
      "type": "string"
    }
  },
  "required": ["newPassword"]
}
```

<h3 id="superadminuserscontroller_forcepasswordchange-parameters">Parameters</h3>

| Name          | In   | Type                                          | Required | Description |
| ------------- | ---- | --------------------------------------------- | -------- | ----------- |
| id            | path | string(uuid)                                  | true     | User UUID   |
| body          | body | [ChangePasswordDto](#schemachangepassworddto) | true     | none        |
| » newPassword | body | string                                        | true     | none        |

<h3 id="superadminuserscontroller_forcepasswordchange-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5) | Password changed successfully         | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## SuperadminUsersController_reactivateUser

<a id="opIdSuperadminUsersController_reactivateUser"></a>

`PATCH /superadmin/users/{id}/reactivate`

_Reactivate user_

Re-enables a deactivated user and clears their Redis block, restoring access (SUPERADMIN only).

<h3 id="superadminuserscontroller_reactivateuser-parameters">Parameters</h3>

| Name | In   | Type         | Required | Description |
| ---- | ---- | ------------ | -------- | ----------- |
| id   | path | string(uuid) | true     | User UUID   |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "User UUID"
        },
        "email": {
          "type": "string",
          "example": "superadmin@yopmail.com",
          "description": "User email address"
        },
        "role": {
          "type": "string",
          "example": "ADMIN",
          "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
          "description": "RBAC role"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Whether this account is active and can log in"
        },
        "telegramId": {
          "type": "object",
          "example": "987654321",
          "nullable": true,
          "description": "Telegram user ID linked for TMA login. Null if not linked."
        },
        "lastLoginAt": {
          "type": "object",
          "example": "2026-02-24T08:30:00.000Z",
          "nullable": true,
          "description": "Timestamp of last successful login"
        },
        "lastIpAddress": {
          "type": "object",
          "example": "103.10.20.5",
          "nullable": true,
          "description": "IP address from the last login"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-01-15T10:00:00.000Z",
          "description": "Account creation timestamp"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:30:00.000Z",
          "description": "Last profile update timestamp"
        }
      },
      "required": [
        "id",
        "email",
        "role",
        "isActive",
        "telegramId",
        "lastLoginAt",
        "lastIpAddress",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="superadminuserscontroller_reactivateuser-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | User reactivated                      | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="superadminuserscontroller_reactivateuser-responseschema">Response Schema</h3>

Status Code **200**

| Name             | Type                                      | Required | Restrictions | Description                                                |
| ---------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------- |
| » statusCode     | number                                    | false    | none         | none                                                       |
| » message        | string                                    | false    | none         | none                                                       |
| » data           | [UserResponseDto](#schemauserresponsedto) | false    | none         | none                                                       |
| »» id            | string                                    | true     | none         | User UUID                                                  |
| »» email         | string                                    | true     | none         | User email address                                         |
| »» role          | string                                    | true     | none         | RBAC role                                                  |
| »» isActive      | boolean                                   | true     | none         | Whether this account is active and can log in              |
| »» telegramId    | object¦null                               | true     | none         | Telegram user ID linked for TMA login. Null if not linked. |
| »» lastLoginAt   | object¦null                               | true     | none         | Timestamp of last successful login                         |
| »» lastIpAddress | object¦null                               | true     | none         | IP address from the last login                             |
| »» createdAt     | string(date-time)                         | true     | none         | Account creation timestamp                                 |
| »» updatedAt     | string(date-time)                         | true     | none         | Last profile update timestamp                              |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## SuperadminUsersController_changeUserRole

<a id="opIdSuperadminUsersController_changeUserRole"></a>

`PATCH /superadmin/users/{id}/role`

_Change user role_

Updates a user's role. Cannot change own role (SUPERADMIN only).

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "role": {
      "type": "string",
      "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
      "example": "ADMIN",
      "description": "New role to assign to the user"
    }
  },
  "required": ["role"]
}
```

<h3 id="superadminuserscontroller_changeuserrole-parameters">Parameters</h3>

| Name   | In   | Type                                  | Required | Description                    |
| ------ | ---- | ------------------------------------- | -------- | ------------------------------ |
| id     | path | string(uuid)                          | true     | User UUID                      |
| body   | body | [ChangeRoleDto](#schemachangeroledto) | true     | none                           |
| » role | body | string                                | true     | New role to assign to the user |

#### Enumerated Values

| Parameter | Value      |
| --------- | ---------- |
| » role    | SUPERADMIN |
| » role    | OWNER      |
| » role    | ADMIN      |
| » role    | STAFF      |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "User UUID"
        },
        "email": {
          "type": "string",
          "example": "superadmin@yopmail.com",
          "description": "User email address"
        },
        "role": {
          "type": "string",
          "example": "ADMIN",
          "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
          "description": "RBAC role"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Whether this account is active and can log in"
        },
        "telegramId": {
          "type": "object",
          "example": "987654321",
          "nullable": true,
          "description": "Telegram user ID linked for TMA login. Null if not linked."
        },
        "lastLoginAt": {
          "type": "object",
          "example": "2026-02-24T08:30:00.000Z",
          "nullable": true,
          "description": "Timestamp of last successful login"
        },
        "lastIpAddress": {
          "type": "object",
          "example": "103.10.20.5",
          "nullable": true,
          "description": "IP address from the last login"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-01-15T10:00:00.000Z",
          "description": "Account creation timestamp"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:30:00.000Z",
          "description": "Last profile update timestamp"
        }
      },
      "required": [
        "id",
        "email",
        "role",
        "isActive",
        "telegramId",
        "lastLoginAt",
        "lastIpAddress",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="superadminuserscontroller_changeuserrole-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Role updated                          | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="superadminuserscontroller_changeuserrole-responseschema">Response Schema</h3>

Status Code **200**

| Name             | Type                                      | Required | Restrictions | Description                                                |
| ---------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------- |
| » statusCode     | number                                    | false    | none         | none                                                       |
| » message        | string                                    | false    | none         | none                                                       |
| » data           | [UserResponseDto](#schemauserresponsedto) | false    | none         | none                                                       |
| »» id            | string                                    | true     | none         | User UUID                                                  |
| »» email         | string                                    | true     | none         | User email address                                         |
| »» role          | string                                    | true     | none         | RBAC role                                                  |
| »» isActive      | boolean                                   | true     | none         | Whether this account is active and can log in              |
| »» telegramId    | object¦null                               | true     | none         | Telegram user ID linked for TMA login. Null if not linked. |
| »» lastLoginAt   | object¦null                               | true     | none         | Timestamp of last successful login                         |
| »» lastIpAddress | object¦null                               | true     | none         | IP address from the last login                             |
| »» createdAt     | string(date-time)                         | true     | none         | Account creation timestamp                                 |
| »» updatedAt     | string(date-time)                         | true     | none         | Last profile update timestamp                              |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="titan-journal-crm-api-leads">leads</h1>

## LeadsController_submitInfo

<a id="opIdLeadsController_submitInfo"></a>

`POST /leads/submit-info`

_Submit lead info (public)_

Public endpoint: a lead submits their email and/or HFM Broker ID via Telegram bot.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "telegramUserId": {
      "type": "number",
      "example": 123456789,
      "description": "Telegram user ID of the lead"
    },
    "email": {
      "type": "string",
      "example": "lead@example.com"
    },
    "hfmBrokerId": {
      "type": "string",
      "example": "HFM-123456",
      "description": "HFM broker account ID"
    },
    "phoneNumber": {
      "type": "string",
      "example": "+60123456789",
      "description": "Lead's phone number (No. Fon)"
    },
    "depositBalance": {
      "type": "string",
      "example": "500.00",
      "description": "Deposit or balance amount (decimal string)"
    },
    "registeredAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-22T10:00:00Z",
      "description": "When the lead submitted their registration"
    }
  },
  "required": ["telegramUserId"]
}
```

<h3 id="leadscontroller_submitinfo-parameters">Parameters</h3>

| Name             | In   | Type                                          | Required | Description                                |
| ---------------- | ---- | --------------------------------------------- | -------- | ------------------------------------------ |
| body             | body | [SubmitLeadInfoDto](#schemasubmitleadinfodto) | true     | none                                       |
| » telegramUserId | body | number                                        | true     | Telegram user ID of the lead               |
| » email          | body | string                                        | false    | none                                       |
| » hfmBrokerId    | body | string                                        | false    | HFM broker account ID                      |
| » phoneNumber    | body | string                                        | false    | Lead's phone number (No. Fon)              |
| » depositBalance | body | string                                        | false    | Deposit or balance amount (decimal string) |
| » registeredAt   | body | string(date-time)                             | false    | When the lead submitted their registration |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "Lead UUID"
        },
        "telegramUserId": {
          "type": "string",
          "example": "123456789",
          "description": "Telegram user ID (serialised as string due to BigInt)"
        },
        "username": {
          "type": "object",
          "example": "john_doe",
          "nullable": true,
          "description": "Telegram @username without @"
        },
        "displayName": {
          "type": "object",
          "example": "John Doe",
          "nullable": true,
          "description": "Telegram display name"
        },
        "status": {
          "type": "string",
          "example": "NEW",
          "enum": [
            "NEW",
            "CONTACTED",
            "REGISTERED",
            "DEPOSIT_REPORTED",
            "DEPOSIT_CONFIRMED",
            "REJECTED"
          ],
          "description": "Current CRM lead status"
        },
        "hfmBrokerId": {
          "type": "object",
          "example": "HFM-123456",
          "nullable": true,
          "description": "HFM broker account ID submitted by the lead"
        },
        "email": {
          "type": "object",
          "example": "lead@example.com",
          "nullable": true,
          "description": "Email address submitted by the lead"
        },
        "phoneNumber": {
          "type": "object",
          "example": "+60123456789",
          "nullable": true,
          "description": "Phone number submitted by the lead"
        },
        "depositBalance": {
          "type": "object",
          "example": "500.00",
          "nullable": true,
          "description": "Lifetime deposit balance as decimal string (Prisma Decimal serialised)"
        },
        "registeredAt": {
          "type": "object",
          "example": "2026-02-20T10:00:00.000Z",
          "nullable": true,
          "description": "When the lead submitted registration proof"
        },
        "verifiedAt": {
          "type": "object",
          "example": "2026-02-21T12:00:00.000Z",
          "nullable": true,
          "description": "When an Owner/Admin verified the lead"
        },
        "handoverMode": {
          "type": "boolean",
          "example": false,
          "description": "When true the bot hands off to a human agent; bot stops auto-replying"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-18T08:00:00.000Z",
          "description": "When the lead first messaged the bot"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T09:00:00.000Z",
          "description": "Last time any lead field was updated"
        }
      },
      "required": [
        "id",
        "telegramUserId",
        "username",
        "displayName",
        "status",
        "hfmBrokerId",
        "email",
        "phoneNumber",
        "depositBalance",
        "registeredAt",
        "verifiedAt",
        "handoverMode",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="leadscontroller_submitinfo-responses">Responses</h3>

| Status | Meaning                                                                  | Description        | Schema |
| ------ | ------------------------------------------------------------------------ | ------------------ | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                  | Lead info updated  | Inline |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)           | Resource not found | None   |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed  | None   |

<h3 id="leadscontroller_submitinfo-responseschema">Response Schema</h3>

Status Code **200**

| Name              | Type                                      | Required | Restrictions | Description                                                            |
| ----------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------------------- |
| » statusCode      | number                                    | false    | none         | none                                                                   |
| » message         | string                                    | false    | none         | none                                                                   |
| » data            | [LeadResponseDto](#schemaleadresponsedto) | false    | none         | none                                                                   |
| »» id             | string                                    | true     | none         | Lead UUID                                                              |
| »» telegramUserId | string                                    | true     | none         | Telegram user ID (serialised as string due to BigInt)                  |
| »» username       | object¦null                               | true     | none         | Telegram @username without @                                           |
| »» displayName    | object¦null                               | true     | none         | Telegram display name                                                  |
| »» status         | string                                    | true     | none         | Current CRM lead status                                                |
| »» hfmBrokerId    | object¦null                               | true     | none         | HFM broker account ID submitted by the lead                            |
| »» email          | object¦null                               | true     | none         | Email address submitted by the lead                                    |
| »» phoneNumber    | object¦null                               | true     | none         | Phone number submitted by the lead                                     |
| »» depositBalance | object¦null                               | true     | none         | Lifetime deposit balance as decimal string (Prisma Decimal serialised) |
| »» registeredAt   | object¦null                               | true     | none         | When the lead submitted registration proof                             |
| »» verifiedAt     | object¦null                               | true     | none         | When an Owner/Admin verified the lead                                  |
| »» handoverMode   | boolean                                   | true     | none         | When true the bot hands off to a human agent; bot stops auto-replying  |
| »» createdAt      | string(date-time)                         | true     | none         | When the lead first messaged the bot                                   |
| »» updatedAt      | string(date-time)                         | true     | none         | Last time any lead field was updated                                   |

#### Enumerated Values

| Property | Value             |
| -------- | ----------------- |
| status   | NEW               |
| status   | CONTACTED         |
| status   | REGISTERED        |
| status   | DEPOSIT_REPORTED  |
| status   | DEPOSIT_CONFIRMED |
| status   | REJECTED          |

<aside class="success">
This operation does not require authentication
</aside>

## LeadsController_findAll

<a id="opIdLeadsController_findAll"></a>

`GET /leads`

_List leads_

Paginated list of all leads with filtering, search and sort. All roles can view.

<h3 id="leadscontroller_findall-parameters">Parameters</h3>

| Name       | In    | Type    | Required | Description                                                                |
| ---------- | ----- | ------- | -------- | -------------------------------------------------------------------------- |
| status     | query | string  | false    | Filter by lead status                                                      |
| contactId  | query | string  | false    | Filter by Telegram user ID (exact)                                         |
| registered | query | boolean | false    | true = has registeredAt, false = no registeredAt                           |
| balanceMin | query | number  | false    | Min deposit balance (inclusive)                                            |
| balanceMax | query | number  | false    | Max deposit balance (inclusive)                                            |
| search     | query | string  | false    | Full-text search on username, displayName, email, phoneNumber, hfmBrokerId |
| orderBy    | query | string  | false    | Field to sort by (default: createdAt)                                      |
| order      | query | string  | false    | Sort direction (default: desc)                                             |
| skip       | query | number  | false    | Pagination offset                                                          |
| take       | query | number  | false    | Page size (default 20, max 200)                                            |

#### Enumerated Values

| Parameter | Value             |
| --------- | ----------------- |
| status    | NEW               |
| status    | CONTACTED         |
| status    | REGISTERED        |
| status    | DEPOSIT_REPORTED  |
| status    | DEPOSIT_CONFIRMED |
| orderBy   | createdAt         |
| orderBy   | updatedAt         |
| orderBy   | depositBalance    |
| orderBy   | registeredAt      |
| orderBy   | aiScore           |
| order     | asc               |
| order     | desc              |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "description": "Lead UUID"
          },
          "telegramUserId": {
            "type": "string",
            "example": "123456789",
            "description": "Telegram user ID (serialised as string due to BigInt)"
          },
          "username": {
            "type": "object",
            "example": "john_doe",
            "nullable": true,
            "description": "Telegram @username without @"
          },
          "displayName": {
            "type": "object",
            "example": "John Doe",
            "nullable": true,
            "description": "Telegram display name"
          },
          "status": {
            "type": "string",
            "example": "NEW",
            "enum": [
              "NEW",
              "CONTACTED",
              "REGISTERED",
              "DEPOSIT_REPORTED",
              "DEPOSIT_CONFIRMED",
              "REJECTED"
            ],
            "description": "Current CRM lead status"
          },
          "hfmBrokerId": {
            "type": "object",
            "example": "HFM-123456",
            "nullable": true,
            "description": "HFM broker account ID submitted by the lead"
          },
          "email": {
            "type": "object",
            "example": "lead@example.com",
            "nullable": true,
            "description": "Email address submitted by the lead"
          },
          "phoneNumber": {
            "type": "object",
            "example": "+60123456789",
            "nullable": true,
            "description": "Phone number submitted by the lead"
          },
          "depositBalance": {
            "type": "object",
            "example": "500.00",
            "nullable": true,
            "description": "Lifetime deposit balance as decimal string (Prisma Decimal serialised)"
          },
          "registeredAt": {
            "type": "object",
            "example": "2026-02-20T10:00:00.000Z",
            "nullable": true,
            "description": "When the lead submitted registration proof"
          },
          "verifiedAt": {
            "type": "object",
            "example": "2026-02-21T12:00:00.000Z",
            "nullable": true,
            "description": "When an Owner/Admin verified the lead"
          },
          "handoverMode": {
            "type": "boolean",
            "example": false,
            "description": "When true the bot hands off to a human agent; bot stops auto-replying"
          },
          "createdAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-18T08:00:00.000Z",
            "description": "When the lead first messaged the bot"
          },
          "updatedAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-24T09:00:00.000Z",
            "description": "Last time any lead field was updated"
          }
        },
        "required": [
          "id",
          "telegramUserId",
          "username",
          "displayName",
          "status",
          "hfmBrokerId",
          "email",
          "phoneNumber",
          "depositBalance",
          "registeredAt",
          "verifiedAt",
          "handoverMode",
          "createdAt",
          "updatedAt"
        ]
      }
    }
  }
}
```

<h3 id="leadscontroller_findall-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Leads retrieved                       | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="leadscontroller_findall-responseschema">Response Schema</h3>

Status Code **200**

| Name              | Type                                        | Required | Restrictions | Description                                                            |
| ----------------- | ------------------------------------------- | -------- | ------------ | ---------------------------------------------------------------------- |
| » statusCode      | number                                      | false    | none         | none                                                                   |
| » message         | string                                      | false    | none         | none                                                                   |
| » data            | [[LeadResponseDto](#schemaleadresponsedto)] | false    | none         | none                                                                   |
| »» id             | string                                      | true     | none         | Lead UUID                                                              |
| »» telegramUserId | string                                      | true     | none         | Telegram user ID (serialised as string due to BigInt)                  |
| »» username       | object¦null                                 | true     | none         | Telegram @username without @                                           |
| »» displayName    | object¦null                                 | true     | none         | Telegram display name                                                  |
| »» status         | string                                      | true     | none         | Current CRM lead status                                                |
| »» hfmBrokerId    | object¦null                                 | true     | none         | HFM broker account ID submitted by the lead                            |
| »» email          | object¦null                                 | true     | none         | Email address submitted by the lead                                    |
| »» phoneNumber    | object¦null                                 | true     | none         | Phone number submitted by the lead                                     |
| »» depositBalance | object¦null                                 | true     | none         | Lifetime deposit balance as decimal string (Prisma Decimal serialised) |
| »» registeredAt   | object¦null                                 | true     | none         | When the lead submitted registration proof                             |
| »» verifiedAt     | object¦null                                 | true     | none         | When an Owner/Admin verified the lead                                  |
| »» handoverMode   | boolean                                     | true     | none         | When true the bot hands off to a human agent; bot stops auto-replying  |
| »» createdAt      | string(date-time)                           | true     | none         | When the lead first messaged the bot                                   |
| »» updatedAt      | string(date-time)                           | true     | none         | Last time any lead field was updated                                   |

#### Enumerated Values

| Property | Value             |
| -------- | ----------------- |
| status   | NEW               |
| status   | CONTACTED         |
| status   | REGISTERED        |
| status   | DEPOSIT_REPORTED  |
| status   | DEPOSIT_CONFIRMED |
| status   | REJECTED          |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## LeadsController_leaderboard

<a id="opIdLeadsController_leaderboard"></a>

`GET /leads/leaderboard`

_AI score leaderboard_

Leads ordered by aiScore DESC. Tier: hot≥70, warm≥40, cold<40.

<h3 id="leadscontroller_leaderboard-parameters">Parameters</h3>

| Name  | In    | Type   | Required | Description |
| ----- | ----- | ------ | -------- | ----------- |
| limit | query | number | false    | none        |
| tier  | query | string | false    | none        |

#### Enumerated Values

| Parameter | Value |
| --------- | ----- |
| tier      | hot   |
| tier      | warm  |
| tier      | cold  |

<h3 id="leadscontroller_leaderboard-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Leaderboard retrieved                 | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## LeadsController_exportCsv

<a id="opIdLeadsController_exportCsv"></a>

`GET /leads/export`

_Export leads as CSV_

Streams a CSV file of all leads matching optional filters.

<h3 id="leadscontroller_exportcsv-parameters">Parameters</h3>

| Name   | In    | Type   | Required | Description        |
| ------ | ----- | ------ | -------- | ------------------ |
| status | query | string | false    | none               |
| from   | query | string | false    | ISO8601 start date |
| to     | query | string | false    | ISO8601 end date   |

#### Enumerated Values

| Parameter | Value             |
| --------- | ----------------- |
| status    | NEW               |
| status    | CONTACTED         |
| status    | REGISTERED        |
| status    | DEPOSIT_REPORTED  |
| status    | DEPOSIT_CONFIRMED |

> Example responses

<h3 id="leadscontroller_exportcsv-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | CSV file stream                       | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="leadscontroller_exportcsv-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## LeadsController_bulkSetHandover

<a id="opIdLeadsController_bulkSetHandover"></a>

`PATCH /leads/bulk/handover`

_Bulk toggle handover mode for all leads_

Enables/disables human handover mode for ALL leads at once. Syncs each to Redis.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "handoverMode": {
      "type": "boolean",
      "example": true,
      "description": "Enable (true) or disable (false) handover mode for all leads"
    }
  },
  "required": ["handoverMode"]
}
```

<h3 id="leadscontroller_bulksethandover-parameters">Parameters</h3>

| Name           | In   | Type                                      | Required | Description                                                  |
| -------------- | ---- | ----------------------------------------- | -------- | ------------------------------------------------------------ |
| body           | body | [BulkHandoverDto](#schemabulkhandoverdto) | true     | none                                                         |
| » handoverMode | body | boolean                                   | true     | Enable (true) or disable (false) handover mode for all leads |

<h3 id="leadscontroller_bulksethandover-responses">Responses</h3>

| Status | Meaning                                                                  | Description                           | Schema |
| ------ | ------------------------------------------------------------------------ | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                  | Handover mode updated for all leads   | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)          | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)           | Forbidden – insufficient role         | None   |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed                     | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## LeadsController_findOne

<a id="opIdLeadsController_findOne"></a>

`GET /leads/{id}`

_Get lead by ID_

Returns a lead and its full interaction history.

<h3 id="leadscontroller_findone-parameters">Parameters</h3>

| Name | In   | Type         | Required | Description |
| ---- | ---- | ------------ | -------- | ----------- |
| id   | path | string(uuid) | true     | Lead UUID   |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "Lead UUID"
        },
        "telegramUserId": {
          "type": "string",
          "example": "123456789",
          "description": "Telegram user ID (serialised as string due to BigInt)"
        },
        "username": {
          "type": "object",
          "example": "john_doe",
          "nullable": true,
          "description": "Telegram @username without @"
        },
        "displayName": {
          "type": "object",
          "example": "John Doe",
          "nullable": true,
          "description": "Telegram display name"
        },
        "status": {
          "type": "string",
          "example": "NEW",
          "enum": [
            "NEW",
            "CONTACTED",
            "REGISTERED",
            "DEPOSIT_REPORTED",
            "DEPOSIT_CONFIRMED",
            "REJECTED"
          ],
          "description": "Current CRM lead status"
        },
        "hfmBrokerId": {
          "type": "object",
          "example": "HFM-123456",
          "nullable": true,
          "description": "HFM broker account ID submitted by the lead"
        },
        "email": {
          "type": "object",
          "example": "lead@example.com",
          "nullable": true,
          "description": "Email address submitted by the lead"
        },
        "phoneNumber": {
          "type": "object",
          "example": "+60123456789",
          "nullable": true,
          "description": "Phone number submitted by the lead"
        },
        "depositBalance": {
          "type": "object",
          "example": "500.00",
          "nullable": true,
          "description": "Lifetime deposit balance as decimal string (Prisma Decimal serialised)"
        },
        "registeredAt": {
          "type": "object",
          "example": "2026-02-20T10:00:00.000Z",
          "nullable": true,
          "description": "When the lead submitted registration proof"
        },
        "verifiedAt": {
          "type": "object",
          "example": "2026-02-21T12:00:00.000Z",
          "nullable": true,
          "description": "When an Owner/Admin verified the lead"
        },
        "handoverMode": {
          "type": "boolean",
          "example": false,
          "description": "When true the bot hands off to a human agent; bot stops auto-replying"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-18T08:00:00.000Z",
          "description": "When the lead first messaged the bot"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T09:00:00.000Z",
          "description": "Last time any lead field was updated"
        }
      },
      "required": [
        "id",
        "telegramUserId",
        "username",
        "displayName",
        "status",
        "hfmBrokerId",
        "email",
        "phoneNumber",
        "depositBalance",
        "registeredAt",
        "verifiedAt",
        "handoverMode",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="leadscontroller_findone-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Lead retrieved                        | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | Resource not found                    | None   |

<h3 id="leadscontroller_findone-responseschema">Response Schema</h3>

Status Code **200**

| Name              | Type                                      | Required | Restrictions | Description                                                            |
| ----------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------------------- |
| » statusCode      | number                                    | false    | none         | none                                                                   |
| » message         | string                                    | false    | none         | none                                                                   |
| » data            | [LeadResponseDto](#schemaleadresponsedto) | false    | none         | none                                                                   |
| »» id             | string                                    | true     | none         | Lead UUID                                                              |
| »» telegramUserId | string                                    | true     | none         | Telegram user ID (serialised as string due to BigInt)                  |
| »» username       | object¦null                               | true     | none         | Telegram @username without @                                           |
| »» displayName    | object¦null                               | true     | none         | Telegram display name                                                  |
| »» status         | string                                    | true     | none         | Current CRM lead status                                                |
| »» hfmBrokerId    | object¦null                               | true     | none         | HFM broker account ID submitted by the lead                            |
| »» email          | object¦null                               | true     | none         | Email address submitted by the lead                                    |
| »» phoneNumber    | object¦null                               | true     | none         | Phone number submitted by the lead                                     |
| »» depositBalance | object¦null                               | true     | none         | Lifetime deposit balance as decimal string (Prisma Decimal serialised) |
| »» registeredAt   | object¦null                               | true     | none         | When the lead submitted registration proof                             |
| »» verifiedAt     | object¦null                               | true     | none         | When an Owner/Admin verified the lead                                  |
| »» handoverMode   | boolean                                   | true     | none         | When true the bot hands off to a human agent; bot stops auto-replying  |
| »» createdAt      | string(date-time)                         | true     | none         | When the lead first messaged the bot                                   |
| »» updatedAt      | string(date-time)                         | true     | none         | Last time any lead field was updated                                   |

#### Enumerated Values

| Property | Value             |
| -------- | ----------------- |
| status   | NEW               |
| status   | CONTACTED         |
| status   | REGISTERED        |
| status   | DEPOSIT_REPORTED  |
| status   | DEPOSIT_CONFIRMED |
| status   | REJECTED          |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## LeadsController_updateStatus

<a id="opIdLeadsController_updateStatus"></a>

`PATCH /leads/{id}/status`

_Update lead status_

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "NEW",
        "CONTACTED",
        "REGISTERED",
        "DEPOSIT_REPORTED",
        "DEPOSIT_CONFIRMED"
      ],
      "example": "CONTACTED",
      "description": "New lead status"
    }
  },
  "required": ["status"]
}
```

<h3 id="leadscontroller_updatestatus-parameters">Parameters</h3>

| Name     | In   | Type                                              | Required | Description     |
| -------- | ---- | ------------------------------------------------- | -------- | --------------- |
| id       | path | string(uuid)                                      | true     | Lead UUID       |
| body     | body | [UpdateLeadStatusDto](#schemaupdateleadstatusdto) | true     | none            |
| » status | body | string                                            | true     | New lead status |

#### Enumerated Values

| Parameter | Value             |
| --------- | ----------------- |
| » status  | NEW               |
| » status  | CONTACTED         |
| » status  | REGISTERED        |
| » status  | DEPOSIT_REPORTED  |
| » status  | DEPOSIT_CONFIRMED |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "Lead UUID"
        },
        "telegramUserId": {
          "type": "string",
          "example": "123456789",
          "description": "Telegram user ID (serialised as string due to BigInt)"
        },
        "username": {
          "type": "object",
          "example": "john_doe",
          "nullable": true,
          "description": "Telegram @username without @"
        },
        "displayName": {
          "type": "object",
          "example": "John Doe",
          "nullable": true,
          "description": "Telegram display name"
        },
        "status": {
          "type": "string",
          "example": "NEW",
          "enum": [
            "NEW",
            "CONTACTED",
            "REGISTERED",
            "DEPOSIT_REPORTED",
            "DEPOSIT_CONFIRMED",
            "REJECTED"
          ],
          "description": "Current CRM lead status"
        },
        "hfmBrokerId": {
          "type": "object",
          "example": "HFM-123456",
          "nullable": true,
          "description": "HFM broker account ID submitted by the lead"
        },
        "email": {
          "type": "object",
          "example": "lead@example.com",
          "nullable": true,
          "description": "Email address submitted by the lead"
        },
        "phoneNumber": {
          "type": "object",
          "example": "+60123456789",
          "nullable": true,
          "description": "Phone number submitted by the lead"
        },
        "depositBalance": {
          "type": "object",
          "example": "500.00",
          "nullable": true,
          "description": "Lifetime deposit balance as decimal string (Prisma Decimal serialised)"
        },
        "registeredAt": {
          "type": "object",
          "example": "2026-02-20T10:00:00.000Z",
          "nullable": true,
          "description": "When the lead submitted registration proof"
        },
        "verifiedAt": {
          "type": "object",
          "example": "2026-02-21T12:00:00.000Z",
          "nullable": true,
          "description": "When an Owner/Admin verified the lead"
        },
        "handoverMode": {
          "type": "boolean",
          "example": false,
          "description": "When true the bot hands off to a human agent; bot stops auto-replying"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-18T08:00:00.000Z",
          "description": "When the lead first messaged the bot"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T09:00:00.000Z",
          "description": "Last time any lead field was updated"
        }
      },
      "required": [
        "id",
        "telegramUserId",
        "username",
        "displayName",
        "status",
        "hfmBrokerId",
        "email",
        "phoneNumber",
        "depositBalance",
        "registeredAt",
        "verifiedAt",
        "handoverMode",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="leadscontroller_updatestatus-responses">Responses</h3>

| Status | Meaning                                                                  | Description                           | Schema |
| ------ | ------------------------------------------------------------------------ | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                  | Lead status updated                   | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)          | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)           | Forbidden – insufficient role         | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)           | Resource not found                    | None   |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed                     | None   |

<h3 id="leadscontroller_updatestatus-responseschema">Response Schema</h3>

Status Code **200**

| Name              | Type                                      | Required | Restrictions | Description                                                            |
| ----------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------------------- |
| » statusCode      | number                                    | false    | none         | none                                                                   |
| » message         | string                                    | false    | none         | none                                                                   |
| » data            | [LeadResponseDto](#schemaleadresponsedto) | false    | none         | none                                                                   |
| »» id             | string                                    | true     | none         | Lead UUID                                                              |
| »» telegramUserId | string                                    | true     | none         | Telegram user ID (serialised as string due to BigInt)                  |
| »» username       | object¦null                               | true     | none         | Telegram @username without @                                           |
| »» displayName    | object¦null                               | true     | none         | Telegram display name                                                  |
| »» status         | string                                    | true     | none         | Current CRM lead status                                                |
| »» hfmBrokerId    | object¦null                               | true     | none         | HFM broker account ID submitted by the lead                            |
| »» email          | object¦null                               | true     | none         | Email address submitted by the lead                                    |
| »» phoneNumber    | object¦null                               | true     | none         | Phone number submitted by the lead                                     |
| »» depositBalance | object¦null                               | true     | none         | Lifetime deposit balance as decimal string (Prisma Decimal serialised) |
| »» registeredAt   | object¦null                               | true     | none         | When the lead submitted registration proof                             |
| »» verifiedAt     | object¦null                               | true     | none         | When an Owner/Admin verified the lead                                  |
| »» handoverMode   | boolean                                   | true     | none         | When true the bot hands off to a human agent; bot stops auto-replying  |
| »» createdAt      | string(date-time)                         | true     | none         | When the lead first messaged the bot                                   |
| »» updatedAt      | string(date-time)                         | true     | none         | Last time any lead field was updated                                   |

#### Enumerated Values

| Property | Value             |
| -------- | ----------------- |
| status   | NEW               |
| status   | CONTACTED         |
| status   | REGISTERED        |
| status   | DEPOSIT_REPORTED  |
| status   | DEPOSIT_CONFIRMED |
| status   | REJECTED          |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## LeadsController_setHandover

<a id="opIdLeadsController_setHandover"></a>

`PATCH /leads/{id}/handover`

_Toggle handover mode_

Enables/disables human handover mode for a lead. Instantly synced to Redis for bot awareness.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "handoverMode": {
      "type": "boolean",
      "example": true,
      "description": "Enable (true) or disable (false) handover mode"
    }
  },
  "required": ["handoverMode"]
}
```

<h3 id="leadscontroller_sethandover-parameters">Parameters</h3>

| Name           | In   | Type                                          | Required | Description                                    |
| -------------- | ---- | --------------------------------------------- | -------- | ---------------------------------------------- |
| id             | path | string(uuid)                                  | true     | Lead UUID                                      |
| body           | body | [UpdateHandoverDto](#schemaupdatehandoverdto) | true     | none                                           |
| » handoverMode | body | boolean                                       | true     | Enable (true) or disable (false) handover mode |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "Lead UUID"
        },
        "telegramUserId": {
          "type": "string",
          "example": "123456789",
          "description": "Telegram user ID (serialised as string due to BigInt)"
        },
        "username": {
          "type": "object",
          "example": "john_doe",
          "nullable": true,
          "description": "Telegram @username without @"
        },
        "displayName": {
          "type": "object",
          "example": "John Doe",
          "nullable": true,
          "description": "Telegram display name"
        },
        "status": {
          "type": "string",
          "example": "NEW",
          "enum": [
            "NEW",
            "CONTACTED",
            "REGISTERED",
            "DEPOSIT_REPORTED",
            "DEPOSIT_CONFIRMED",
            "REJECTED"
          ],
          "description": "Current CRM lead status"
        },
        "hfmBrokerId": {
          "type": "object",
          "example": "HFM-123456",
          "nullable": true,
          "description": "HFM broker account ID submitted by the lead"
        },
        "email": {
          "type": "object",
          "example": "lead@example.com",
          "nullable": true,
          "description": "Email address submitted by the lead"
        },
        "phoneNumber": {
          "type": "object",
          "example": "+60123456789",
          "nullable": true,
          "description": "Phone number submitted by the lead"
        },
        "depositBalance": {
          "type": "object",
          "example": "500.00",
          "nullable": true,
          "description": "Lifetime deposit balance as decimal string (Prisma Decimal serialised)"
        },
        "registeredAt": {
          "type": "object",
          "example": "2026-02-20T10:00:00.000Z",
          "nullable": true,
          "description": "When the lead submitted registration proof"
        },
        "verifiedAt": {
          "type": "object",
          "example": "2026-02-21T12:00:00.000Z",
          "nullable": true,
          "description": "When an Owner/Admin verified the lead"
        },
        "handoverMode": {
          "type": "boolean",
          "example": false,
          "description": "When true the bot hands off to a human agent; bot stops auto-replying"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-18T08:00:00.000Z",
          "description": "When the lead first messaged the bot"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T09:00:00.000Z",
          "description": "Last time any lead field was updated"
        }
      },
      "required": [
        "id",
        "telegramUserId",
        "username",
        "displayName",
        "status",
        "hfmBrokerId",
        "email",
        "phoneNumber",
        "depositBalance",
        "registeredAt",
        "verifiedAt",
        "handoverMode",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="leadscontroller_sethandover-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Handover mode updated                 | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | Resource not found                    | None   |

<h3 id="leadscontroller_sethandover-responseschema">Response Schema</h3>

Status Code **200**

| Name              | Type                                      | Required | Restrictions | Description                                                            |
| ----------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------------------- |
| » statusCode      | number                                    | false    | none         | none                                                                   |
| » message         | string                                    | false    | none         | none                                                                   |
| » data            | [LeadResponseDto](#schemaleadresponsedto) | false    | none         | none                                                                   |
| »» id             | string                                    | true     | none         | Lead UUID                                                              |
| »» telegramUserId | string                                    | true     | none         | Telegram user ID (serialised as string due to BigInt)                  |
| »» username       | object¦null                               | true     | none         | Telegram @username without @                                           |
| »» displayName    | object¦null                               | true     | none         | Telegram display name                                                  |
| »» status         | string                                    | true     | none         | Current CRM lead status                                                |
| »» hfmBrokerId    | object¦null                               | true     | none         | HFM broker account ID submitted by the lead                            |
| »» email          | object¦null                               | true     | none         | Email address submitted by the lead                                    |
| »» phoneNumber    | object¦null                               | true     | none         | Phone number submitted by the lead                                     |
| »» depositBalance | object¦null                               | true     | none         | Lifetime deposit balance as decimal string (Prisma Decimal serialised) |
| »» registeredAt   | object¦null                               | true     | none         | When the lead submitted registration proof                             |
| »» verifiedAt     | object¦null                               | true     | none         | When an Owner/Admin verified the lead                                  |
| »» handoverMode   | boolean                                   | true     | none         | When true the bot hands off to a human agent; bot stops auto-replying  |
| »» createdAt      | string(date-time)                         | true     | none         | When the lead first messaged the bot                                   |
| »» updatedAt      | string(date-time)                         | true     | none         | Last time any lead field was updated                                   |

#### Enumerated Values

| Property | Value             |
| -------- | ----------------- |
| status   | NEW               |
| status   | CONTACTED         |
| status   | REGISTERED        |
| status   | DEPOSIT_REPORTED  |
| status   | DEPOSIT_CONFIRMED |
| status   | REJECTED          |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## LeadsController_verifyLead

<a id="opIdLeadsController_verifyLead"></a>

`PATCH /leads/{id}/verify`

_Verify lead_

Owner manually verifies the registration/deposit proof. Sets verifiedAt timestamp.

<h3 id="leadscontroller_verifylead-parameters">Parameters</h3>

| Name | In   | Type         | Required | Description |
| ---- | ---- | ------------ | -------- | ----------- |
| id   | path | string(uuid) | true     | Lead UUID   |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "Lead UUID"
        },
        "telegramUserId": {
          "type": "string",
          "example": "123456789",
          "description": "Telegram user ID (serialised as string due to BigInt)"
        },
        "username": {
          "type": "object",
          "example": "john_doe",
          "nullable": true,
          "description": "Telegram @username without @"
        },
        "displayName": {
          "type": "object",
          "example": "John Doe",
          "nullable": true,
          "description": "Telegram display name"
        },
        "status": {
          "type": "string",
          "example": "NEW",
          "enum": [
            "NEW",
            "CONTACTED",
            "REGISTERED",
            "DEPOSIT_REPORTED",
            "DEPOSIT_CONFIRMED",
            "REJECTED"
          ],
          "description": "Current CRM lead status"
        },
        "hfmBrokerId": {
          "type": "object",
          "example": "HFM-123456",
          "nullable": true,
          "description": "HFM broker account ID submitted by the lead"
        },
        "email": {
          "type": "object",
          "example": "lead@example.com",
          "nullable": true,
          "description": "Email address submitted by the lead"
        },
        "phoneNumber": {
          "type": "object",
          "example": "+60123456789",
          "nullable": true,
          "description": "Phone number submitted by the lead"
        },
        "depositBalance": {
          "type": "object",
          "example": "500.00",
          "nullable": true,
          "description": "Lifetime deposit balance as decimal string (Prisma Decimal serialised)"
        },
        "registeredAt": {
          "type": "object",
          "example": "2026-02-20T10:00:00.000Z",
          "nullable": true,
          "description": "When the lead submitted registration proof"
        },
        "verifiedAt": {
          "type": "object",
          "example": "2026-02-21T12:00:00.000Z",
          "nullable": true,
          "description": "When an Owner/Admin verified the lead"
        },
        "handoverMode": {
          "type": "boolean",
          "example": false,
          "description": "When true the bot hands off to a human agent; bot stops auto-replying"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-18T08:00:00.000Z",
          "description": "When the lead first messaged the bot"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T09:00:00.000Z",
          "description": "Last time any lead field was updated"
        }
      },
      "required": [
        "id",
        "telegramUserId",
        "username",
        "displayName",
        "status",
        "hfmBrokerId",
        "email",
        "phoneNumber",
        "depositBalance",
        "registeredAt",
        "verifiedAt",
        "handoverMode",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="leadscontroller_verifylead-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Lead verified                         | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | Resource not found                    | None   |

<h3 id="leadscontroller_verifylead-responseschema">Response Schema</h3>

Status Code **200**

| Name              | Type                                      | Required | Restrictions | Description                                                            |
| ----------------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------------------- |
| » statusCode      | number                                    | false    | none         | none                                                                   |
| » message         | string                                    | false    | none         | none                                                                   |
| » data            | [LeadResponseDto](#schemaleadresponsedto) | false    | none         | none                                                                   |
| »» id             | string                                    | true     | none         | Lead UUID                                                              |
| »» telegramUserId | string                                    | true     | none         | Telegram user ID (serialised as string due to BigInt)                  |
| »» username       | object¦null                               | true     | none         | Telegram @username without @                                           |
| »» displayName    | object¦null                               | true     | none         | Telegram display name                                                  |
| »» status         | string                                    | true     | none         | Current CRM lead status                                                |
| »» hfmBrokerId    | object¦null                               | true     | none         | HFM broker account ID submitted by the lead                            |
| »» email          | object¦null                               | true     | none         | Email address submitted by the lead                                    |
| »» phoneNumber    | object¦null                               | true     | none         | Phone number submitted by the lead                                     |
| »» depositBalance | object¦null                               | true     | none         | Lifetime deposit balance as decimal string (Prisma Decimal serialised) |
| »» registeredAt   | object¦null                               | true     | none         | When the lead submitted registration proof                             |
| »» verifiedAt     | object¦null                               | true     | none         | When an Owner/Admin verified the lead                                  |
| »» handoverMode   | boolean                                   | true     | none         | When true the bot hands off to a human agent; bot stops auto-replying  |
| »» createdAt      | string(date-time)                         | true     | none         | When the lead first messaged the bot                                   |
| »» updatedAt      | string(date-time)                         | true     | none         | Last time any lead field was updated                                   |

#### Enumerated Values

| Property | Value             |
| -------- | ----------------- |
| status   | NEW               |
| status   | CONTACTED         |
| status   | REGISTERED        |
| status   | DEPOSIT_REPORTED  |
| status   | DEPOSIT_CONFIRMED |
| status   | REJECTED          |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## LeadsController_getInteractions

<a id="opIdLeadsController_getInteractions"></a>

`GET /leads/{id}/interactions`

_Paginated interaction timeline for a lead_

<h3 id="leadscontroller_getinteractions-parameters">Parameters</h3>

| Name | In    | Type         | Required | Description |
| ---- | ----- | ------------ | -------- | ----------- |
| id   | path  | string(uuid) | true     | none        |
| skip | query | number       | false    | none        |
| take | query | number       | false    | none        |
| type | query | string       | false    | none        |

#### Enumerated Values

| Parameter | Value                |
| --------- | -------------------- |
| type      | MESSAGE_RECEIVED     |
| type      | AUTO_REPLY_SENT      |
| type      | MANUAL_REPLY_SENT    |
| type      | SYSTEM_STATUS_CHANGE |

<h3 id="leadscontroller_getinteractions-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Interactions retrieved                | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | Resource not found                    | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="titan-journal-crm-api-knowledge-base">knowledge-base</h1>

## KnowledgeBaseController_findAll

<a id="opIdKnowledgeBaseController_findAll"></a>

`GET /knowledge-base`

_List all KB entries_

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "description": "Knowledge base entry UUID"
          },
          "title": {
            "type": "string",
            "example": "How to Register on HFM",
            "description": "Entry title shown in the CRM and used as RAG context heading"
          },
          "content": {
            "type": "string",
            "example": "To register a new trading account, visit https://hfm.com and click...",
            "description": "Full text content (used for vector embedding)"
          },
          "type": {
            "type": "string",
            "enum": ["TEXT", "LINK", "TEMPLATE"],
            "example": "TEXT",
            "description": "TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template"
          },
          "fileType": {
            "type": "string",
            "enum": [
              "TEXT_MANUAL",
              "PDF",
              "DOCX",
              "IMAGE",
              "VIDEO_LINK",
              "EXTERNAL_LINK"
            ],
            "example": "TEXT_MANUAL",
            "description": "How the content was ingested"
          },
          "url": {
            "type": "object",
            "example": "https://drive.google.com/file/d/xyz",
            "nullable": true,
            "description": "External URL for LINK or TEMPLATE entries"
          },
          "status": {
            "type": "string",
            "enum": ["PENDING", "PROCESSING", "READY", "FAILED"],
            "example": "READY",
            "description": "Processing status — only READY entries are used by the RAG pipeline"
          },
          "isActive": {
            "type": "boolean",
            "example": true,
            "description": "Inactive entries are excluded from vector search"
          },
          "createdAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-20T10:00:00.000Z"
          },
          "updatedAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-24T08:00:00.000Z"
          }
        },
        "required": [
          "id",
          "title",
          "content",
          "type",
          "fileType",
          "status",
          "isActive",
          "createdAt",
          "updatedAt"
        ]
      }
    }
  }
}
```

<h3 id="knowledgebasecontroller_findall-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Entries retrieved                     | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="knowledgebasecontroller_findall-responseschema">Response Schema</h3>

Status Code **200**

| Name         | Type                                    | Required | Restrictions | Description                                                                 |
| ------------ | --------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------- |
| » statusCode | number                                  | false    | none         | none                                                                        |
| » message    | string                                  | false    | none         | none                                                                        |
| » data       | [[KbResponseDto](#schemakbresponsedto)] | false    | none         | none                                                                        |
| »» id        | string                                  | true     | none         | Knowledge base entry UUID                                                   |
| »» title     | string                                  | true     | none         | Entry title shown in the CRM and used as RAG context heading                |
| »» content   | string                                  | true     | none         | Full text content (used for vector embedding)                               |
| »» type      | string                                  | true     | none         | TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template |
| »» fileType  | string                                  | true     | none         | How the content was ingested                                                |
| »» url       | object¦null                             | false    | none         | External URL for LINK or TEMPLATE entries                                   |
| »» status    | string                                  | true     | none         | Processing status — only READY entries are used by the RAG pipeline         |
| »» isActive  | boolean                                 | true     | none         | Inactive entries are excluded from vector search                            |
| »» createdAt | string(date-time)                       | true     | none         | none                                                                        |
| »» updatedAt | string(date-time)                       | true     | none         | none                                                                        |

#### Enumerated Values

| Property | Value         |
| -------- | ------------- |
| type     | TEXT          |
| type     | LINK          |
| type     | TEMPLATE      |
| fileType | TEXT_MANUAL   |
| fileType | PDF           |
| fileType | DOCX          |
| fileType | IMAGE         |
| fileType | VIDEO_LINK    |
| fileType | EXTERNAL_LINK |
| status   | PENDING       |
| status   | PROCESSING    |
| status   | READY         |
| status   | FAILED        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## KnowledgeBaseController_create

<a id="opIdKnowledgeBaseController_create"></a>

`POST /knowledge-base`

_Create KB entry (legacy)_

Use POST /text or POST /upload instead.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "example": "Tutorial Register",
      "minLength": 3
    },
    "content": {
      "type": "string",
      "example": "To register a new trading account, visit...",
      "minLength": 10
    },
    "type": {
      "type": "string",
      "enum": ["TEXT", "LINK", "TEMPLATE"],
      "default": "TEXT",
      "description": "Entry type: TEXT (RAG context), LINK (external resource), TEMPLATE (bot button reply)"
    },
    "url": {
      "type": "string",
      "example": "https://drive.google.com/file/d/...",
      "description": "External URL for LINK/TEMPLATE entries (GDrive, YouTube, S3, etc.)"
    }
  },
  "required": ["title", "content"]
}
```

<h3 id="knowledgebasecontroller_create-parameters">Parameters</h3>

| Name      | In   | Type                              | Required | Description                                                                           |
| --------- | ---- | --------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| body      | body | [CreateKbDto](#schemacreatekbdto) | true     | none                                                                                  |
| » title   | body | string                            | true     | none                                                                                  |
| » content | body | string                            | true     | none                                                                                  |
| » type    | body | string                            | false    | Entry type: TEXT (RAG context), LINK (external resource), TEMPLATE (bot button reply) |
| » url     | body | string                            | false    | External URL for LINK/TEMPLATE entries (GDrive, YouTube, S3, etc.)                    |

#### Enumerated Values

| Parameter | Value    |
| --------- | -------- |
| » type    | TEXT     |
| » type    | LINK     |
| » type    | TEMPLATE |

> Example responses

> 201 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "Knowledge base entry UUID"
        },
        "title": {
          "type": "string",
          "example": "How to Register on HFM",
          "description": "Entry title shown in the CRM and used as RAG context heading"
        },
        "content": {
          "type": "string",
          "example": "To register a new trading account, visit https://hfm.com and click...",
          "description": "Full text content (used for vector embedding)"
        },
        "type": {
          "type": "string",
          "enum": ["TEXT", "LINK", "TEMPLATE"],
          "example": "TEXT",
          "description": "TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template"
        },
        "fileType": {
          "type": "string",
          "enum": [
            "TEXT_MANUAL",
            "PDF",
            "DOCX",
            "IMAGE",
            "VIDEO_LINK",
            "EXTERNAL_LINK"
          ],
          "example": "TEXT_MANUAL",
          "description": "How the content was ingested"
        },
        "url": {
          "type": "object",
          "example": "https://drive.google.com/file/d/xyz",
          "nullable": true,
          "description": "External URL for LINK or TEMPLATE entries"
        },
        "status": {
          "type": "string",
          "enum": ["PENDING", "PROCESSING", "READY", "FAILED"],
          "example": "READY",
          "description": "Processing status — only READY entries are used by the RAG pipeline"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Inactive entries are excluded from vector search"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-20T10:00:00.000Z"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:00:00.000Z"
        }
      },
      "required": [
        "id",
        "title",
        "content",
        "type",
        "fileType",
        "status",
        "isActive",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="knowledgebasecontroller_create-responses">Responses</h3>

| Status | Meaning                                                      | Description   | Schema |
| ------ | ------------------------------------------------------------ | ------------- | ------ |
| 201    | [Created](https://tools.ietf.org/html/rfc7231#section-6.3.2) | Entry created | Inline |

<h3 id="knowledgebasecontroller_create-responseschema">Response Schema</h3>

Status Code **201**

| Name         | Type                                  | Required | Restrictions | Description                                                                 |
| ------------ | ------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------- |
| » statusCode | number                                | false    | none         | none                                                                        |
| » message    | string                                | false    | none         | none                                                                        |
| » data       | [KbResponseDto](#schemakbresponsedto) | false    | none         | none                                                                        |
| »» id        | string                                | true     | none         | Knowledge base entry UUID                                                   |
| »» title     | string                                | true     | none         | Entry title shown in the CRM and used as RAG context heading                |
| »» content   | string                                | true     | none         | Full text content (used for vector embedding)                               |
| »» type      | string                                | true     | none         | TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template |
| »» fileType  | string                                | true     | none         | How the content was ingested                                                |
| »» url       | object¦null                           | false    | none         | External URL for LINK or TEMPLATE entries                                   |
| »» status    | string                                | true     | none         | Processing status — only READY entries are used by the RAG pipeline         |
| »» isActive  | boolean                               | true     | none         | Inactive entries are excluded from vector search                            |
| »» createdAt | string(date-time)                     | true     | none         | none                                                                        |
| »» updatedAt | string(date-time)                     | true     | none         | none                                                                        |

#### Enumerated Values

| Property | Value         |
| -------- | ------------- |
| type     | TEXT          |
| type     | LINK          |
| type     | TEMPLATE      |
| fileType | TEXT_MANUAL   |
| fileType | PDF           |
| fileType | DOCX          |
| fileType | IMAGE         |
| fileType | VIDEO_LINK    |
| fileType | EXTERNAL_LINK |
| status   | PENDING       |
| status   | PROCESSING    |
| status   | READY         |
| status   | FAILED        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## KnowledgeBaseController_findActive

<a id="opIdKnowledgeBaseController_findActive"></a>

`GET /knowledge-base/active`

_List active KB entries (RAG-ready)_

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "description": "Knowledge base entry UUID"
          },
          "title": {
            "type": "string",
            "example": "How to Register on HFM",
            "description": "Entry title shown in the CRM and used as RAG context heading"
          },
          "content": {
            "type": "string",
            "example": "To register a new trading account, visit https://hfm.com and click...",
            "description": "Full text content (used for vector embedding)"
          },
          "type": {
            "type": "string",
            "enum": ["TEXT", "LINK", "TEMPLATE"],
            "example": "TEXT",
            "description": "TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template"
          },
          "fileType": {
            "type": "string",
            "enum": [
              "TEXT_MANUAL",
              "PDF",
              "DOCX",
              "IMAGE",
              "VIDEO_LINK",
              "EXTERNAL_LINK"
            ],
            "example": "TEXT_MANUAL",
            "description": "How the content was ingested"
          },
          "url": {
            "type": "object",
            "example": "https://drive.google.com/file/d/xyz",
            "nullable": true,
            "description": "External URL for LINK or TEMPLATE entries"
          },
          "status": {
            "type": "string",
            "enum": ["PENDING", "PROCESSING", "READY", "FAILED"],
            "example": "READY",
            "description": "Processing status — only READY entries are used by the RAG pipeline"
          },
          "isActive": {
            "type": "boolean",
            "example": true,
            "description": "Inactive entries are excluded from vector search"
          },
          "createdAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-20T10:00:00.000Z"
          },
          "updatedAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-24T08:00:00.000Z"
          }
        },
        "required": [
          "id",
          "title",
          "content",
          "type",
          "fileType",
          "status",
          "isActive",
          "createdAt",
          "updatedAt"
        ]
      }
    }
  }
}
```

<h3 id="knowledgebasecontroller_findactive-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Active entries retrieved              | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="knowledgebasecontroller_findactive-responseschema">Response Schema</h3>

Status Code **200**

| Name         | Type                                    | Required | Restrictions | Description                                                                 |
| ------------ | --------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------- |
| » statusCode | number                                  | false    | none         | none                                                                        |
| » message    | string                                  | false    | none         | none                                                                        |
| » data       | [[KbResponseDto](#schemakbresponsedto)] | false    | none         | none                                                                        |
| »» id        | string                                  | true     | none         | Knowledge base entry UUID                                                   |
| »» title     | string                                  | true     | none         | Entry title shown in the CRM and used as RAG context heading                |
| »» content   | string                                  | true     | none         | Full text content (used for vector embedding)                               |
| »» type      | string                                  | true     | none         | TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template |
| »» fileType  | string                                  | true     | none         | How the content was ingested                                                |
| »» url       | object¦null                             | false    | none         | External URL for LINK or TEMPLATE entries                                   |
| »» status    | string                                  | true     | none         | Processing status — only READY entries are used by the RAG pipeline         |
| »» isActive  | boolean                                 | true     | none         | Inactive entries are excluded from vector search                            |
| »» createdAt | string(date-time)                       | true     | none         | none                                                                        |
| »» updatedAt | string(date-time)                       | true     | none         | none                                                                        |

#### Enumerated Values

| Property | Value         |
| -------- | ------------- |
| type     | TEXT          |
| type     | LINK          |
| type     | TEMPLATE      |
| fileType | TEXT_MANUAL   |
| fileType | PDF           |
| fileType | DOCX          |
| fileType | IMAGE         |
| fileType | VIDEO_LINK    |
| fileType | EXTERNAL_LINK |
| status   | PENDING       |
| status   | PROCESSING    |
| status   | READY         |
| status   | FAILED        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## KnowledgeBaseController_getProcessingStatus

<a id="opIdKnowledgeBaseController_getProcessingStatus"></a>

`GET /knowledge-base/status`

_SSE stream for KB file processing status_

Subscribe with ?kbId=<id> to receive real-time processing updates.

<h3 id="knowledgebasecontroller_getprocessingstatus-parameters">Parameters</h3>

| Name | In    | Type   | Required | Description |
| ---- | ----- | ------ | -------- | ----------- |
| kbId | query | string | true     | none        |

<h3 id="knowledgebasecontroller_getprocessingstatus-responses">Responses</h3>

| Status | Meaning                                                 | Description                                       | Schema |
| ------ | ------------------------------------------------------- | ------------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | SSE stream of { status, progress, kbId?, error? } | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## KnowledgeBaseController_findOne

<a id="opIdKnowledgeBaseController_findOne"></a>

`GET /knowledge-base/{id}`

_Get KB entry by ID_

<h3 id="knowledgebasecontroller_findone-parameters">Parameters</h3>

| Name | In   | Type         | Required | Description |
| ---- | ---- | ------------ | -------- | ----------- |
| id   | path | string(uuid) | true     | none        |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "Knowledge base entry UUID"
        },
        "title": {
          "type": "string",
          "example": "How to Register on HFM",
          "description": "Entry title shown in the CRM and used as RAG context heading"
        },
        "content": {
          "type": "string",
          "example": "To register a new trading account, visit https://hfm.com and click...",
          "description": "Full text content (used for vector embedding)"
        },
        "type": {
          "type": "string",
          "enum": ["TEXT", "LINK", "TEMPLATE"],
          "example": "TEXT",
          "description": "TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template"
        },
        "fileType": {
          "type": "string",
          "enum": [
            "TEXT_MANUAL",
            "PDF",
            "DOCX",
            "IMAGE",
            "VIDEO_LINK",
            "EXTERNAL_LINK"
          ],
          "example": "TEXT_MANUAL",
          "description": "How the content was ingested"
        },
        "url": {
          "type": "object",
          "example": "https://drive.google.com/file/d/xyz",
          "nullable": true,
          "description": "External URL for LINK or TEMPLATE entries"
        },
        "status": {
          "type": "string",
          "enum": ["PENDING", "PROCESSING", "READY", "FAILED"],
          "example": "READY",
          "description": "Processing status — only READY entries are used by the RAG pipeline"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Inactive entries are excluded from vector search"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-20T10:00:00.000Z"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:00:00.000Z"
        }
      },
      "required": [
        "id",
        "title",
        "content",
        "type",
        "fileType",
        "status",
        "isActive",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="knowledgebasecontroller_findone-responses">Responses</h3>

| Status | Meaning                                                        | Description        | Schema |
| ------ | -------------------------------------------------------------- | ------------------ | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)        | Entry retrieved    | Inline |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4) | Resource not found | None   |

<h3 id="knowledgebasecontroller_findone-responseschema">Response Schema</h3>

Status Code **200**

| Name         | Type                                  | Required | Restrictions | Description                                                                 |
| ------------ | ------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------- |
| » statusCode | number                                | false    | none         | none                                                                        |
| » message    | string                                | false    | none         | none                                                                        |
| » data       | [KbResponseDto](#schemakbresponsedto) | false    | none         | none                                                                        |
| »» id        | string                                | true     | none         | Knowledge base entry UUID                                                   |
| »» title     | string                                | true     | none         | Entry title shown in the CRM and used as RAG context heading                |
| »» content   | string                                | true     | none         | Full text content (used for vector embedding)                               |
| »» type      | string                                | true     | none         | TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template |
| »» fileType  | string                                | true     | none         | How the content was ingested                                                |
| »» url       | object¦null                           | false    | none         | External URL for LINK or TEMPLATE entries                                   |
| »» status    | string                                | true     | none         | Processing status — only READY entries are used by the RAG pipeline         |
| »» isActive  | boolean                               | true     | none         | Inactive entries are excluded from vector search                            |
| »» createdAt | string(date-time)                     | true     | none         | none                                                                        |
| »» updatedAt | string(date-time)                     | true     | none         | none                                                                        |

#### Enumerated Values

| Property | Value         |
| -------- | ------------- |
| type     | TEXT          |
| type     | LINK          |
| type     | TEMPLATE      |
| fileType | TEXT_MANUAL   |
| fileType | PDF           |
| fileType | DOCX          |
| fileType | IMAGE         |
| fileType | VIDEO_LINK    |
| fileType | EXTERNAL_LINK |
| status   | PENDING       |
| status   | PROCESSING    |
| status   | READY         |
| status   | FAILED        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## KnowledgeBaseController_update

<a id="opIdKnowledgeBaseController_update"></a>

`PATCH /knowledge-base/{id}`

_Update KB entry_

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "example": "Updated Title",
      "minLength": 3
    },
    "content": {
      "type": "string",
      "example": "Updated content here...",
      "minLength": 10
    },
    "type": {
      "type": "string",
      "enum": ["TEXT", "LINK", "TEMPLATE"],
      "description": "Entry type"
    },
    "url": {
      "type": "string",
      "example": "https://drive.google.com/...",
      "description": "External URL for LINK/TEMPLATE entries"
    },
    "isActive": {
      "type": "boolean",
      "example": true,
      "description": "Activate or deactivate this entry"
    }
  }
}
```

<h3 id="knowledgebasecontroller_update-parameters">Parameters</h3>

| Name       | In   | Type                              | Required | Description                            |
| ---------- | ---- | --------------------------------- | -------- | -------------------------------------- |
| id         | path | string(uuid)                      | true     | none                                   |
| body       | body | [UpdateKbDto](#schemaupdatekbdto) | true     | none                                   |
| » title    | body | string                            | false    | none                                   |
| » content  | body | string                            | false    | none                                   |
| » type     | body | string                            | false    | Entry type                             |
| » url      | body | string                            | false    | External URL for LINK/TEMPLATE entries |
| » isActive | body | boolean                           | false    | Activate or deactivate this entry      |

#### Enumerated Values

| Parameter | Value    |
| --------- | -------- |
| » type    | TEXT     |
| » type    | LINK     |
| » type    | TEMPLATE |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "Knowledge base entry UUID"
        },
        "title": {
          "type": "string",
          "example": "How to Register on HFM",
          "description": "Entry title shown in the CRM and used as RAG context heading"
        },
        "content": {
          "type": "string",
          "example": "To register a new trading account, visit https://hfm.com and click...",
          "description": "Full text content (used for vector embedding)"
        },
        "type": {
          "type": "string",
          "enum": ["TEXT", "LINK", "TEMPLATE"],
          "example": "TEXT",
          "description": "TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template"
        },
        "fileType": {
          "type": "string",
          "enum": [
            "TEXT_MANUAL",
            "PDF",
            "DOCX",
            "IMAGE",
            "VIDEO_LINK",
            "EXTERNAL_LINK"
          ],
          "example": "TEXT_MANUAL",
          "description": "How the content was ingested"
        },
        "url": {
          "type": "object",
          "example": "https://drive.google.com/file/d/xyz",
          "nullable": true,
          "description": "External URL for LINK or TEMPLATE entries"
        },
        "status": {
          "type": "string",
          "enum": ["PENDING", "PROCESSING", "READY", "FAILED"],
          "example": "READY",
          "description": "Processing status — only READY entries are used by the RAG pipeline"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Inactive entries are excluded from vector search"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-20T10:00:00.000Z"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:00:00.000Z"
        }
      },
      "required": [
        "id",
        "title",
        "content",
        "type",
        "fileType",
        "status",
        "isActive",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="knowledgebasecontroller_update-responses">Responses</h3>

| Status | Meaning                                                        | Description        | Schema |
| ------ | -------------------------------------------------------------- | ------------------ | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)        | Entry updated      | Inline |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4) | Resource not found | None   |

<h3 id="knowledgebasecontroller_update-responseschema">Response Schema</h3>

Status Code **200**

| Name         | Type                                  | Required | Restrictions | Description                                                                 |
| ------------ | ------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------- |
| » statusCode | number                                | false    | none         | none                                                                        |
| » message    | string                                | false    | none         | none                                                                        |
| » data       | [KbResponseDto](#schemakbresponsedto) | false    | none         | none                                                                        |
| »» id        | string                                | true     | none         | Knowledge base entry UUID                                                   |
| »» title     | string                                | true     | none         | Entry title shown in the CRM and used as RAG context heading                |
| »» content   | string                                | true     | none         | Full text content (used for vector embedding)                               |
| »» type      | string                                | true     | none         | TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template |
| »» fileType  | string                                | true     | none         | How the content was ingested                                                |
| »» url       | object¦null                           | false    | none         | External URL for LINK or TEMPLATE entries                                   |
| »» status    | string                                | true     | none         | Processing status — only READY entries are used by the RAG pipeline         |
| »» isActive  | boolean                               | true     | none         | Inactive entries are excluded from vector search                            |
| »» createdAt | string(date-time)                     | true     | none         | none                                                                        |
| »» updatedAt | string(date-time)                     | true     | none         | none                                                                        |

#### Enumerated Values

| Property | Value         |
| -------- | ------------- |
| type     | TEXT          |
| type     | LINK          |
| type     | TEMPLATE      |
| fileType | TEXT_MANUAL   |
| fileType | PDF           |
| fileType | DOCX          |
| fileType | IMAGE         |
| fileType | VIDEO_LINK    |
| fileType | EXTERNAL_LINK |
| status   | PENDING       |
| status   | PROCESSING    |
| status   | READY         |
| status   | FAILED        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## KnowledgeBaseController_remove

<a id="opIdKnowledgeBaseController_remove"></a>

`DELETE /knowledge-base/{id}`

_Delete KB entry_

<h3 id="knowledgebasecontroller_remove-parameters">Parameters</h3>

| Name | In   | Type         | Required | Description |
| ---- | ---- | ------------ | -------- | ----------- |
| id   | path | string(uuid) | true     | none        |

<h3 id="knowledgebasecontroller_remove-responses">Responses</h3>

| Status | Meaning                                                         | Description   | Schema |
| ------ | --------------------------------------------------------------- | ------------- | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5) | Entry deleted | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## KnowledgeBaseController_createText

<a id="opIdKnowledgeBaseController_createText"></a>

`POST /knowledge-base/text`

_Create text/link KB entry_

Embedding generated immediately in background.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "example": "Tutorial Register",
      "minLength": 3
    },
    "content": {
      "type": "string",
      "example": "To register a new trading account, visit...",
      "minLength": 10
    },
    "type": {
      "type": "string",
      "enum": ["TEXT", "LINK", "TEMPLATE"],
      "default": "TEXT",
      "description": "Entry type: TEXT (RAG context), LINK (external resource), TEMPLATE (bot button reply)"
    },
    "url": {
      "type": "string",
      "example": "https://drive.google.com/file/d/...",
      "description": "External URL for LINK/TEMPLATE entries (GDrive, YouTube, S3, etc.)"
    }
  },
  "required": ["title", "content"]
}
```

<h3 id="knowledgebasecontroller_createtext-parameters">Parameters</h3>

| Name      | In   | Type                              | Required | Description                                                                           |
| --------- | ---- | --------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| body      | body | [CreateKbDto](#schemacreatekbdto) | true     | none                                                                                  |
| » title   | body | string                            | true     | none                                                                                  |
| » content | body | string                            | true     | none                                                                                  |
| » type    | body | string                            | false    | Entry type: TEXT (RAG context), LINK (external resource), TEMPLATE (bot button reply) |
| » url     | body | string                            | false    | External URL for LINK/TEMPLATE entries (GDrive, YouTube, S3, etc.)                    |

#### Enumerated Values

| Parameter | Value    |
| --------- | -------- |
| » type    | TEXT     |
| » type    | LINK     |
| » type    | TEMPLATE |

> Example responses

> 201 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "Knowledge base entry UUID"
        },
        "title": {
          "type": "string",
          "example": "How to Register on HFM",
          "description": "Entry title shown in the CRM and used as RAG context heading"
        },
        "content": {
          "type": "string",
          "example": "To register a new trading account, visit https://hfm.com and click...",
          "description": "Full text content (used for vector embedding)"
        },
        "type": {
          "type": "string",
          "enum": ["TEXT", "LINK", "TEMPLATE"],
          "example": "TEXT",
          "description": "TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template"
        },
        "fileType": {
          "type": "string",
          "enum": [
            "TEXT_MANUAL",
            "PDF",
            "DOCX",
            "IMAGE",
            "VIDEO_LINK",
            "EXTERNAL_LINK"
          ],
          "example": "TEXT_MANUAL",
          "description": "How the content was ingested"
        },
        "url": {
          "type": "object",
          "example": "https://drive.google.com/file/d/xyz",
          "nullable": true,
          "description": "External URL for LINK or TEMPLATE entries"
        },
        "status": {
          "type": "string",
          "enum": ["PENDING", "PROCESSING", "READY", "FAILED"],
          "example": "READY",
          "description": "Processing status — only READY entries are used by the RAG pipeline"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Inactive entries are excluded from vector search"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-20T10:00:00.000Z"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:00:00.000Z"
        }
      },
      "required": [
        "id",
        "title",
        "content",
        "type",
        "fileType",
        "status",
        "isActive",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="knowledgebasecontroller_createtext-responses">Responses</h3>

| Status | Meaning                                                                  | Description       | Schema |
| ------ | ------------------------------------------------------------------------ | ----------------- | ------ |
| 201    | [Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)             | Entry created     | Inline |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed | None   |

<h3 id="knowledgebasecontroller_createtext-responseschema">Response Schema</h3>

Status Code **201**

| Name         | Type                                  | Required | Restrictions | Description                                                                 |
| ------------ | ------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------- |
| » statusCode | number                                | false    | none         | none                                                                        |
| » message    | string                                | false    | none         | none                                                                        |
| » data       | [KbResponseDto](#schemakbresponsedto) | false    | none         | none                                                                        |
| »» id        | string                                | true     | none         | Knowledge base entry UUID                                                   |
| »» title     | string                                | true     | none         | Entry title shown in the CRM and used as RAG context heading                |
| »» content   | string                                | true     | none         | Full text content (used for vector embedding)                               |
| »» type      | string                                | true     | none         | TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template |
| »» fileType  | string                                | true     | none         | How the content was ingested                                                |
| »» url       | object¦null                           | false    | none         | External URL for LINK or TEMPLATE entries                                   |
| »» status    | string                                | true     | none         | Processing status — only READY entries are used by the RAG pipeline         |
| »» isActive  | boolean                               | true     | none         | Inactive entries are excluded from vector search                            |
| »» createdAt | string(date-time)                     | true     | none         | none                                                                        |
| »» updatedAt | string(date-time)                     | true     | none         | none                                                                        |

#### Enumerated Values

| Property | Value         |
| -------- | ------------- |
| type     | TEXT          |
| type     | LINK          |
| type     | TEMPLATE      |
| fileType | TEXT_MANUAL   |
| fileType | PDF           |
| fileType | DOCX          |
| fileType | IMAGE         |
| fileType | VIDEO_LINK    |
| fileType | EXTERNAL_LINK |
| status   | PENDING       |
| status   | PROCESSING    |
| status   | READY         |
| status   | FAILED        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## KnowledgeBaseController_uploadFile

<a id="opIdKnowledgeBaseController_uploadFile"></a>

`POST /knowledge-base/upload`

_Upload file to KB (PDF, DOCX, image)_

File is processed asynchronously. Subscribe to GET /knowledge-base/status?kbId=<id> for real-time progress.

> Body parameter

```yaml
type: object
required:
  - file
  - title
properties:
  file:
    type: string
    format: binary
  title:
    type: string
```

<h3 id="knowledgebasecontroller_uploadfile-parameters">Parameters</h3>

| Name    | In   | Type           | Required | Description |
| ------- | ---- | -------------- | -------- | ----------- |
| body    | body | object         | true     | none        |
| » file  | body | string(binary) | true     | none        |
| » title | body | string         | true     | none        |

<h3 id="knowledgebasecontroller_uploadfile-responses">Responses</h3>

| Status | Meaning                                                                  | Description                         | Schema |
| ------ | ------------------------------------------------------------------------ | ----------------------------------- | ------ |
| 201    | [Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)             | Upload accepted, processing started | None   |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed                   | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## KnowledgeBaseController_reembedMissing

<a id="opIdKnowledgeBaseController_reembedMissing"></a>

`POST /knowledge-base/admin/reembed-missing`

_Re-embed missing KB entries_

Queues async embedding generation for all active KB entries that have a null embedding vector. Use after API failures or to backfill legacy entries.

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "properties": {
        "queued": {
          "type": "number"
        }
      }
    }
  }
}
```

<h3 id="knowledgebasecontroller_reembedmissing-responses">Responses</h3>

| Status | Meaning                                                 | Description | Schema |
| ------ | ------------------------------------------------------- | ----------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none        | Inline |

<h3 id="knowledgebasecontroller_reembedmissing-responseschema">Response Schema</h3>

Status Code **200**

| Name         | Type   | Required | Restrictions | Description |
| ------------ | ------ | -------- | ------------ | ----------- |
| » statusCode | number | false    | none         | none        |
| » message    | string | false    | none         | none        |
| » data       | object | false    | none         | none        |
| »» queued    | number | false    | none         | none        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer, bearer
</aside>

## KnowledgeBaseController_embeddingStats

<a id="opIdKnowledgeBaseController_embeddingStats"></a>

`GET /knowledge-base/admin/embedding-stats`

_Embedding coverage stats_

Returns counts of embedded vs missing embedding for KB entries.

<h3 id="knowledgebasecontroller_embeddingstats-responses">Responses</h3>

| Status | Meaning                                                 | Description | Schema |
| ------ | ------------------------------------------------------- | ----------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none        | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer, bearer
</aside>

<h1 id="titan-journal-crm-api-command-menu">command-menu</h1>

## CommandMenuController_findAll

<a id="opIdCommandMenuController_findAll"></a>

`GET /command-menu`

_List all command menu entries_

Returns all command menus ordered by display order.

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "clxyz123abc456",
            "description": "Command menu record UUID"
          },
          "command": {
            "type": "string",
            "example": "tutorial-register",
            "description": "URL-safe slug, also used as Telegram /command"
          },
          "label": {
            "type": "string",
            "example": "📖 Tutorial Register",
            "description": "Button label shown in Telegram inline keyboard"
          },
          "description": {
            "type": "object",
            "example": "Step-by-step guide to register your HFM account",
            "nullable": true,
            "description": "Short description shown in Telegram command list"
          },
          "content": {
            "type": "object",
            "description": "Tiptap JSON document — rendered as Telegram message blocks",
            "example": {
              "type": "doc",
              "content": [
                {
                  "type": "paragraph",
                  "content": [{}]
                }
              ]
            }
          },
          "isActive": {
            "type": "boolean",
            "example": true,
            "description": "Inactive menus are hidden from the Telegram /menu keyboard"
          },
          "showInMenu": {
            "type": "boolean",
            "example": true,
            "description": "Whether this entry appears in the /start inline menu"
          },
          "showInKeyboard": {
            "type": "boolean",
            "example": false,
            "description": "Whether this entry appears in the persistent bottom reply keyboard (max 4)"
          },
          "order": {
            "type": "number",
            "example": 0,
            "description": "Display order in the Telegram menu (ascending)"
          },
          "createdAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-20T10:00:00.000Z"
          },
          "updatedAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-24T08:00:00.000Z"
          }
        },
        "required": [
          "id",
          "command",
          "label",
          "content",
          "isActive",
          "showInMenu",
          "showInKeyboard",
          "order",
          "createdAt",
          "updatedAt"
        ]
      }
    }
  }
}
```

<h3 id="commandmenucontroller_findall-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Command menus retrieved               | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="commandmenucontroller_findall-responseschema">Response Schema</h3>

Status Code **200**

| Name              | Type                                                      | Required | Restrictions | Description                                                                |
| ----------------- | --------------------------------------------------------- | -------- | ------------ | -------------------------------------------------------------------------- |
| » statusCode      | number                                                    | false    | none         | none                                                                       |
| » message         | string                                                    | false    | none         | none                                                                       |
| » data            | [[CommandMenuResponseDto](#schemacommandmenuresponsedto)] | false    | none         | none                                                                       |
| »» id             | string                                                    | true     | none         | Command menu record UUID                                                   |
| »» command        | string                                                    | true     | none         | URL-safe slug, also used as Telegram /command                              |
| »» label          | string                                                    | true     | none         | Button label shown in Telegram inline keyboard                             |
| »» description    | object¦null                                               | false    | none         | Short description shown in Telegram command list                           |
| »» content        | object                                                    | true     | none         | Tiptap JSON document — rendered as Telegram message blocks                 |
| »» isActive       | boolean                                                   | true     | none         | Inactive menus are hidden from the Telegram /menu keyboard                 |
| »» showInMenu     | boolean                                                   | true     | none         | Whether this entry appears in the /start inline menu                       |
| »» showInKeyboard | boolean                                                   | true     | none         | Whether this entry appears in the persistent bottom reply keyboard (max 4) |
| »» order          | number                                                    | true     | none         | Display order in the Telegram menu (ascending)                             |
| »» createdAt      | string(date-time)                                         | true     | none         | none                                                                       |
| »» updatedAt      | string(date-time)                                         | true     | none         | none                                                                       |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## CommandMenuController_create

<a id="opIdCommandMenuController_create"></a>

`POST /command-menu`

_Create command menu_

Creates a new command menu with Tiptap rich content. Embedding generated asynchronously.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "command": {
      "type": "string",
      "example": "tutorial-register",
      "description": "URL-safe slug. Used as Telegram bot command (e.g. /tutorial-register)."
    },
    "label": {
      "type": "string",
      "example": "📖 Tutorial Register",
      "description": "Button display label shown in Telegram inline keyboard."
    },
    "description": {
      "type": "string",
      "example": "Step-by-step guide to register your account",
      "description": "Short description shown in Telegram bot commands list."
    },
    "content": {
      "type": "object",
      "description": "Tiptap JSON document (block-based rich content)",
      "example": {
        "type": "doc",
        "content": [
          {
            "type": "heading",
            "attrs": {
              "level": 2
            },
            "content": [
              {
                "type": "text",
                "text": "How to Register"
              }
            ]
          },
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "Follow these steps..."
              }
            ]
          }
        ]
      }
    },
    "order": {
      "type": "number",
      "example": 0,
      "description": "Display order in the Telegram menu (ascending)."
    },
    "showInMenu": {
      "type": "boolean",
      "example": true,
      "description": "Show this entry in the /start inline menu (default true)."
    },
    "showInKeyboard": {
      "type": "boolean",
      "example": false,
      "description": "Show this entry in the persistent bottom reply keyboard (max 4 entries, default false)."
    }
  },
  "required": ["command", "label", "content"]
}
```

<h3 id="commandmenucontroller_create-parameters">Parameters</h3>

| Name             | In   | Type                                                | Required | Description                                                                             |
| ---------------- | ---- | --------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| body             | body | [CreateCommandMenuDto](#schemacreatecommandmenudto) | true     | none                                                                                    |
| » command        | body | string                                              | true     | URL-safe slug. Used as Telegram bot command (e.g. /tutorial-register).                  |
| » label          | body | string                                              | true     | Button display label shown in Telegram inline keyboard.                                 |
| » description    | body | string                                              | false    | Short description shown in Telegram bot commands list.                                  |
| » content        | body | object                                              | true     | Tiptap JSON document (block-based rich content)                                         |
| » order          | body | number                                              | false    | Display order in the Telegram menu (ascending).                                         |
| » showInMenu     | body | boolean                                             | false    | Show this entry in the /start inline menu (default true).                               |
| » showInKeyboard | body | boolean                                             | false    | Show this entry in the persistent bottom reply keyboard (max 4 entries, default false). |

> Example responses

> 201 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "clxyz123abc456",
          "description": "Command menu record UUID"
        },
        "command": {
          "type": "string",
          "example": "tutorial-register",
          "description": "URL-safe slug, also used as Telegram /command"
        },
        "label": {
          "type": "string",
          "example": "📖 Tutorial Register",
          "description": "Button label shown in Telegram inline keyboard"
        },
        "description": {
          "type": "object",
          "example": "Step-by-step guide to register your HFM account",
          "nullable": true,
          "description": "Short description shown in Telegram command list"
        },
        "content": {
          "type": "object",
          "description": "Tiptap JSON document — rendered as Telegram message blocks",
          "example": {
            "type": "doc",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "Follow these steps..."
                  }
                ]
              }
            ]
          }
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Inactive menus are hidden from the Telegram /menu keyboard"
        },
        "showInMenu": {
          "type": "boolean",
          "example": true,
          "description": "Whether this entry appears in the /start inline menu"
        },
        "showInKeyboard": {
          "type": "boolean",
          "example": false,
          "description": "Whether this entry appears in the persistent bottom reply keyboard (max 4)"
        },
        "order": {
          "type": "number",
          "example": 0,
          "description": "Display order in the Telegram menu (ascending)"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-20T10:00:00.000Z"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:00:00.000Z"
        }
      },
      "required": [
        "id",
        "command",
        "label",
        "content",
        "isActive",
        "showInMenu",
        "showInKeyboard",
        "order",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="commandmenucontroller_create-responses">Responses</h3>

| Status | Meaning                                                                  | Description          | Schema |
| ------ | ------------------------------------------------------------------------ | -------------------- | ------ |
| 201    | [Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)             | Command menu created | Inline |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed    | None   |

<h3 id="commandmenucontroller_create-responseschema">Response Schema</h3>

Status Code **201**

| Name              | Type                                                    | Required | Restrictions | Description                                                                |
| ----------------- | ------------------------------------------------------- | -------- | ------------ | -------------------------------------------------------------------------- |
| » statusCode      | number                                                  | false    | none         | none                                                                       |
| » message         | string                                                  | false    | none         | none                                                                       |
| » data            | [CommandMenuResponseDto](#schemacommandmenuresponsedto) | false    | none         | none                                                                       |
| »» id             | string                                                  | true     | none         | Command menu record UUID                                                   |
| »» command        | string                                                  | true     | none         | URL-safe slug, also used as Telegram /command                              |
| »» label          | string                                                  | true     | none         | Button label shown in Telegram inline keyboard                             |
| »» description    | object¦null                                             | false    | none         | Short description shown in Telegram command list                           |
| »» content        | object                                                  | true     | none         | Tiptap JSON document — rendered as Telegram message blocks                 |
| »» isActive       | boolean                                                 | true     | none         | Inactive menus are hidden from the Telegram /menu keyboard                 |
| »» showInMenu     | boolean                                                 | true     | none         | Whether this entry appears in the /start inline menu                       |
| »» showInKeyboard | boolean                                                 | true     | none         | Whether this entry appears in the persistent bottom reply keyboard (max 4) |
| »» order          | number                                                  | true     | none         | Display order in the Telegram menu (ascending)                             |
| »» createdAt      | string(date-time)                                       | true     | none         | none                                                                       |
| »» updatedAt      | string(date-time)                                       | true     | none         | none                                                                       |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## CommandMenuController_findOne

<a id="opIdCommandMenuController_findOne"></a>

`GET /command-menu/{id}`

_Get command menu by ID_

<h3 id="commandmenucontroller_findone-parameters">Parameters</h3>

| Name | In   | Type   | Required | Description      |
| ---- | ---- | ------ | -------- | ---------------- |
| id   | path | string | true     | CommandMenu UUID |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "clxyz123abc456",
          "description": "Command menu record UUID"
        },
        "command": {
          "type": "string",
          "example": "tutorial-register",
          "description": "URL-safe slug, also used as Telegram /command"
        },
        "label": {
          "type": "string",
          "example": "📖 Tutorial Register",
          "description": "Button label shown in Telegram inline keyboard"
        },
        "description": {
          "type": "object",
          "example": "Step-by-step guide to register your HFM account",
          "nullable": true,
          "description": "Short description shown in Telegram command list"
        },
        "content": {
          "type": "object",
          "description": "Tiptap JSON document — rendered as Telegram message blocks",
          "example": {
            "type": "doc",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "Follow these steps..."
                  }
                ]
              }
            ]
          }
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Inactive menus are hidden from the Telegram /menu keyboard"
        },
        "showInMenu": {
          "type": "boolean",
          "example": true,
          "description": "Whether this entry appears in the /start inline menu"
        },
        "showInKeyboard": {
          "type": "boolean",
          "example": false,
          "description": "Whether this entry appears in the persistent bottom reply keyboard (max 4)"
        },
        "order": {
          "type": "number",
          "example": 0,
          "description": "Display order in the Telegram menu (ascending)"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-20T10:00:00.000Z"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:00:00.000Z"
        }
      },
      "required": [
        "id",
        "command",
        "label",
        "content",
        "isActive",
        "showInMenu",
        "showInKeyboard",
        "order",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="commandmenucontroller_findone-responses">Responses</h3>

| Status | Meaning                                                        | Description            | Schema |
| ------ | -------------------------------------------------------------- | ---------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)        | Command menu retrieved | Inline |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4) | Resource not found     | None   |

<h3 id="commandmenucontroller_findone-responseschema">Response Schema</h3>

Status Code **200**

| Name              | Type                                                    | Required | Restrictions | Description                                                                |
| ----------------- | ------------------------------------------------------- | -------- | ------------ | -------------------------------------------------------------------------- |
| » statusCode      | number                                                  | false    | none         | none                                                                       |
| » message         | string                                                  | false    | none         | none                                                                       |
| » data            | [CommandMenuResponseDto](#schemacommandmenuresponsedto) | false    | none         | none                                                                       |
| »» id             | string                                                  | true     | none         | Command menu record UUID                                                   |
| »» command        | string                                                  | true     | none         | URL-safe slug, also used as Telegram /command                              |
| »» label          | string                                                  | true     | none         | Button label shown in Telegram inline keyboard                             |
| »» description    | object¦null                                             | false    | none         | Short description shown in Telegram command list                           |
| »» content        | object                                                  | true     | none         | Tiptap JSON document — rendered as Telegram message blocks                 |
| »» isActive       | boolean                                                 | true     | none         | Inactive menus are hidden from the Telegram /menu keyboard                 |
| »» showInMenu     | boolean                                                 | true     | none         | Whether this entry appears in the /start inline menu                       |
| »» showInKeyboard | boolean                                                 | true     | none         | Whether this entry appears in the persistent bottom reply keyboard (max 4) |
| »» order          | number                                                  | true     | none         | Display order in the Telegram menu (ascending)                             |
| »» createdAt      | string(date-time)                                       | true     | none         | none                                                                       |
| »» updatedAt      | string(date-time)                                       | true     | none         | none                                                                       |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## CommandMenuController_update

<a id="opIdCommandMenuController_update"></a>

`PATCH /command-menu/{id}`

_Update command menu_

Updates label, description, content, order, or isActive. Re-generates embedding if content changes.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "label": {
      "type": "string",
      "example": "📖 Tutorial Register"
    },
    "description": {
      "type": "string",
      "example": "Step-by-step guide to register your account"
    },
    "content": {
      "type": "object",
      "description": "Tiptap JSON document. Re-generates embedding on save."
    },
    "order": {
      "type": "number",
      "example": 1
    },
    "isActive": {
      "type": "boolean",
      "example": true,
      "description": "Show in /start inline menu"
    },
    "showInMenu": {
      "type": "boolean",
      "example": true,
      "description": "Show in /start inline menu (owner-controlled)"
    },
    "showInKeyboard": {
      "type": "boolean",
      "example": false,
      "description": "Show in persistent bottom reply keyboard (max 4)"
    }
  }
}
```

<h3 id="commandmenucontroller_update-parameters">Parameters</h3>

| Name             | In   | Type                                                | Required | Description                                           |
| ---------------- | ---- | --------------------------------------------------- | -------- | ----------------------------------------------------- |
| id               | path | string                                              | true     | CommandMenu UUID                                      |
| body             | body | [UpdateCommandMenuDto](#schemaupdatecommandmenudto) | true     | none                                                  |
| » label          | body | string                                              | false    | none                                                  |
| » description    | body | string                                              | false    | none                                                  |
| » content        | body | object                                              | false    | Tiptap JSON document. Re-generates embedding on save. |
| » order          | body | number                                              | false    | none                                                  |
| » isActive       | body | boolean                                             | false    | Show in /start inline menu                            |
| » showInMenu     | body | boolean                                             | false    | Show in /start inline menu (owner-controlled)         |
| » showInKeyboard | body | boolean                                             | false    | Show in persistent bottom reply keyboard (max 4)      |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "clxyz123abc456",
          "description": "Command menu record UUID"
        },
        "command": {
          "type": "string",
          "example": "tutorial-register",
          "description": "URL-safe slug, also used as Telegram /command"
        },
        "label": {
          "type": "string",
          "example": "📖 Tutorial Register",
          "description": "Button label shown in Telegram inline keyboard"
        },
        "description": {
          "type": "object",
          "example": "Step-by-step guide to register your HFM account",
          "nullable": true,
          "description": "Short description shown in Telegram command list"
        },
        "content": {
          "type": "object",
          "description": "Tiptap JSON document — rendered as Telegram message blocks",
          "example": {
            "type": "doc",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "Follow these steps..."
                  }
                ]
              }
            ]
          }
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Inactive menus are hidden from the Telegram /menu keyboard"
        },
        "showInMenu": {
          "type": "boolean",
          "example": true,
          "description": "Whether this entry appears in the /start inline menu"
        },
        "showInKeyboard": {
          "type": "boolean",
          "example": false,
          "description": "Whether this entry appears in the persistent bottom reply keyboard (max 4)"
        },
        "order": {
          "type": "number",
          "example": 0,
          "description": "Display order in the Telegram menu (ascending)"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-20T10:00:00.000Z"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:00:00.000Z"
        }
      },
      "required": [
        "id",
        "command",
        "label",
        "content",
        "isActive",
        "showInMenu",
        "showInKeyboard",
        "order",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="commandmenucontroller_update-responses">Responses</h3>

| Status | Meaning                                                        | Description          | Schema |
| ------ | -------------------------------------------------------------- | -------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)        | Command menu updated | Inline |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4) | Resource not found   | None   |

<h3 id="commandmenucontroller_update-responseschema">Response Schema</h3>

Status Code **200**

| Name              | Type                                                    | Required | Restrictions | Description                                                                |
| ----------------- | ------------------------------------------------------- | -------- | ------------ | -------------------------------------------------------------------------- |
| » statusCode      | number                                                  | false    | none         | none                                                                       |
| » message         | string                                                  | false    | none         | none                                                                       |
| » data            | [CommandMenuResponseDto](#schemacommandmenuresponsedto) | false    | none         | none                                                                       |
| »» id             | string                                                  | true     | none         | Command menu record UUID                                                   |
| »» command        | string                                                  | true     | none         | URL-safe slug, also used as Telegram /command                              |
| »» label          | string                                                  | true     | none         | Button label shown in Telegram inline keyboard                             |
| »» description    | object¦null                                             | false    | none         | Short description shown in Telegram command list                           |
| »» content        | object                                                  | true     | none         | Tiptap JSON document — rendered as Telegram message blocks                 |
| »» isActive       | boolean                                                 | true     | none         | Inactive menus are hidden from the Telegram /menu keyboard                 |
| »» showInMenu     | boolean                                                 | true     | none         | Whether this entry appears in the /start inline menu                       |
| »» showInKeyboard | boolean                                                 | true     | none         | Whether this entry appears in the persistent bottom reply keyboard (max 4) |
| »» order          | number                                                  | true     | none         | Display order in the Telegram menu (ascending)                             |
| »» createdAt      | string(date-time)                                       | true     | none         | none                                                                       |
| »» updatedAt      | string(date-time)                                       | true     | none         | none                                                                       |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## CommandMenuController_remove

<a id="opIdCommandMenuController_remove"></a>

`DELETE /command-menu/{id}`

_Delete command menu (SUPERADMIN only)_

<h3 id="commandmenucontroller_remove-parameters">Parameters</h3>

| Name | In   | Type   | Required | Description      |
| ---- | ---- | ------ | -------- | ---------------- |
| id   | path | string | true     | CommandMenu UUID |

<h3 id="commandmenucontroller_remove-responses">Responses</h3>

| Status | Meaning                                                         | Description          | Schema |
| ------ | --------------------------------------------------------------- | -------------------- | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5) | Command menu deleted | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | Resource not found   | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## CommandMenuController_reorder

<a id="opIdCommandMenuController_reorder"></a>

`PATCH /command-menu/reorder`

_Bulk reorder command menus_

Accepts array of { id, order } to update display positions.

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "clxyz123"
          },
          "order": {
            "type": "number",
            "example": 0
          }
        },
        "required": ["id", "order"]
      }
    }
  },
  "required": ["items"]
}
```

<h3 id="commandmenucontroller_reorder-parameters">Parameters</h3>

| Name     | In   | Type                                                  | Required | Description |
| -------- | ---- | ----------------------------------------------------- | -------- | ----------- |
| body     | body | [ReorderCommandMenuDto](#schemareordercommandmenudto) | true     | none        |
| » items  | body | [[CommandMenuOrderItem](#schemacommandmenuorderitem)] | true     | none        |
| »» id    | body | string                                                | true     | none        |
| »» order | body | number                                                | true     | none        |

<h3 id="commandmenucontroller_reorder-responses">Responses</h3>

| Status | Meaning                                                                  | Description       | Schema |
| ------ | ------------------------------------------------------------------------ | ----------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                  | Reorder applied   | None   |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## CommandMenuController_reembedMissing

<a id="opIdCommandMenuController_reembedMissing"></a>

`POST /command-menu/admin/reembed-missing`

_Re-embed missing CommandMenu entries_

Queues async embedding generation for all active CommandMenu entries that have a null embedding vector.

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "properties": {
        "queued": {
          "type": "number"
        }
      }
    }
  }
}
```

<h3 id="commandmenucontroller_reembedmissing-responses">Responses</h3>

| Status | Meaning                                                 | Description | Schema |
| ------ | ------------------------------------------------------- | ----------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none        | Inline |

<h3 id="commandmenucontroller_reembedmissing-responseschema">Response Schema</h3>

Status Code **200**

| Name         | Type   | Required | Restrictions | Description |
| ------------ | ------ | -------- | ------------ | ----------- |
| » statusCode | number | false    | none         | none        |
| » message    | string | false    | none         | none        |
| » data       | object | false    | none         | none        |
| »» queued    | number | false    | none         | none        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="titan-journal-crm-api-bot">bot</h1>

## BotStatusController_getStatus

<a id="opIdBotStatusController_getStatus"></a>

`GET /bot/status`

_Telegram bot health & webhook info (SUPERADMIN)_

<h3 id="botstatuscontroller_getstatus-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Bot status                            | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="titan-journal-crm-api-attachments">attachments</h1>

## AttachmentsController_findByLead

<a id="opIdAttachmentsController_findByLead"></a>

`GET /attachments`

_List attachments for a lead_

Returns all uploaded receipts/screenshots for the given lead UUID.

<h3 id="attachmentscontroller_findbylead-parameters">Parameters</h3>

| Name   | In    | Type         | Required | Description |
| ------ | ----- | ------------ | -------- | ----------- |
| leadId | query | string(uuid) | true     | Lead UUID   |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "leadId": {
            "type": "string"
          },
          "telegramFileId": {
            "type": "object",
            "nullable": true
          },
          "fileKey": {
            "type": "string"
          },
          "fileUrl": {
            "type": "string"
          },
          "mimeType": {
            "type": "object",
            "nullable": true
          },
          "size": {
            "type": "object",
            "nullable": true
          },
          "uploadedAt": {
            "format": "date-time",
            "type": "string"
          }
        },
        "required": [
          "id",
          "leadId",
          "telegramFileId",
          "fileKey",
          "fileUrl",
          "mimeType",
          "size",
          "uploadedAt"
        ]
      }
    }
  }
}
```

<h3 id="attachmentscontroller_findbylead-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Attachments retrieved                 | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | Resource not found                    | None   |

<h3 id="attachmentscontroller_findbylead-responseschema">Response Schema</h3>

Status Code **200**

| Name              | Type                                                    | Required | Restrictions | Description |
| ----------------- | ------------------------------------------------------- | -------- | ------------ | ----------- |
| » statusCode      | number                                                  | false    | none         | none        |
| » message         | string                                                  | false    | none         | none        |
| » data            | [[AttachmentResponseDto](#schemaattachmentresponsedto)] | false    | none         | none        |
| »» id             | string                                                  | true     | none         | none        |
| »» leadId         | string                                                  | true     | none         | none        |
| »» telegramFileId | object¦null                                             | true     | none         | none        |
| »» fileKey        | string                                                  | true     | none         | none        |
| »» fileUrl        | string                                                  | true     | none         | none        |
| »» mimeType       | object¦null                                             | true     | none         | none        |
| »» size           | object¦null                                             | true     | none         | none        |
| »» uploadedAt     | string(date-time)                                       | true     | none         | none        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="titan-journal-crm-api-health">health</h1>

## HealthController_check

<a id="opIdHealthController_check"></a>

`GET /health`

_System health check_

> Example responses

> 200 Response

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "example": "ok"
    },
    "info": {
      "type": "object",
      "example": {
        "database": {
          "status": "up"
        }
      },
      "additionalProperties": {
        "type": "object",
        "required": ["status"],
        "properties": {
          "status": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "nullable": true
    },
    "error": {
      "type": "object",
      "example": {},
      "additionalProperties": {
        "type": "object",
        "required": ["status"],
        "properties": {
          "status": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "nullable": true
    },
    "details": {
      "type": "object",
      "example": {
        "database": {
          "status": "up"
        }
      },
      "additionalProperties": {
        "type": "object",
        "required": ["status"],
        "properties": {
          "status": {
            "type": "string"
          }
        },
        "additionalProperties": true
      }
    }
  }
}
```

<h3 id="healthcontroller_check-responses">Responses</h3>

| Status | Meaning                                                                  | Description                        | Schema |
| ------ | ------------------------------------------------------------------------ | ---------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                  | The Health Check is successful     | Inline |
| 503    | [Service Unavailable](https://tools.ietf.org/html/rfc7231#section-6.6.4) | The Health Check is not successful | Inline |

<h3 id="healthcontroller_check-responseschema">Response Schema</h3>

Status Code **200**

| Name                        | Type        | Required | Restrictions | Description |
| --------------------------- | ----------- | -------- | ------------ | ----------- |
| » status                    | string      | false    | none         | none        |
| » info                      | object¦null | false    | none         | none        |
| »» **additionalProperties** | object      | false    | none         | none        |
| »»» status                  | string      | true     | none         | none        |
| » error                     | object¦null | false    | none         | none        |
| »» **additionalProperties** | object      | false    | none         | none        |
| »»» status                  | string      | true     | none         | none        |
| » details                   | object      | false    | none         | none        |
| »» **additionalProperties** | object      | false    | none         | none        |
| »»» status                  | string      | true     | none         | none        |

Status Code **503**

| Name                        | Type        | Required | Restrictions | Description |
| --------------------------- | ----------- | -------- | ------------ | ----------- |
| » status                    | string      | false    | none         | none        |
| » info                      | object¦null | false    | none         | none        |
| »» **additionalProperties** | object      | false    | none         | none        |
| »»» status                  | string      | true     | none         | none        |
| » error                     | object¦null | false    | none         | none        |
| »» **additionalProperties** | object      | false    | none         | none        |
| »»» status                  | string      | true     | none         | none        |
| » details                   | object      | false    | none         | none        |
| »» **additionalProperties** | object      | false    | none         | none        |
| »»» status                  | string      | true     | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="titan-journal-crm-api-analytics">analytics</h1>

## AnalyticsController_getSummary

<a id="opIdAnalyticsController_getSummary"></a>

`GET /analytics/summary`

_Consolidated Analytics Summary_

Returns consolidated KPI cards, funnel metrics, and trend series data based on a given timeframe.

<h3 id="analyticscontroller_getsummary-parameters">Parameters</h3>

| Name      | In    | Type   | Required | Description                                            |
| --------- | ----- | ------ | -------- | ------------------------------------------------------ |
| timeframe | query | string | false    | The predefined timeframe for the analytics.            |
| startDate | query | string | false    | Required if timeframe is custom (ISO 8601 date string) |
| endDate   | query | string | false    | Required if timeframe is custom (ISO 8601 date string) |

#### Enumerated Values

| Parameter | Value        |
| --------- | ------------ |
| timeframe | today        |
| timeframe | yesterday    |
| timeframe | this_week    |
| timeframe | this_month   |
| timeframe | last_30_days |
| timeframe | last_90_days |
| timeframe | all_time     |
| timeframe | custom       |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "kpi": {
          "type": "object",
          "properties": {
            "totalLeads": {
              "type": "object",
              "properties": {
                "current": {
                  "type": "number",
                  "example": 74,
                  "description": "Value for the current period"
                },
                "previous": {
                  "type": "number",
                  "example": 58,
                  "description": "Value for the previous comparable period"
                },
                "changePercentage": {
                  "type": "number",
                  "example": 27.6,
                  "description": "Percentage change from previous to current period. Positive = growth."
                },
                "trend": {
                  "type": "string",
                  "enum": ["up", "down", "neutral"],
                  "example": "up",
                  "description": "Direction of change"
                }
              },
              "required": ["current", "previous", "changePercentage", "trend"]
            },
            "registeredAccounts": {
              "type": "object",
              "properties": {
                "current": {
                  "type": "number",
                  "example": 74,
                  "description": "Value for the current period"
                },
                "previous": {
                  "type": "number",
                  "example": 58,
                  "description": "Value for the previous comparable period"
                },
                "changePercentage": {
                  "type": "number",
                  "example": 27.6,
                  "description": "Percentage change from previous to current period. Positive = growth."
                },
                "trend": {
                  "type": "string",
                  "enum": ["up", "down", "neutral"],
                  "example": "up",
                  "description": "Direction of change"
                }
              },
              "required": ["current", "previous", "changePercentage", "trend"]
            },
            "depositingClients": {
              "type": "object",
              "properties": {
                "current": {
                  "type": "number",
                  "example": 74,
                  "description": "Value for the current period"
                },
                "previous": {
                  "type": "number",
                  "example": 58,
                  "description": "Value for the previous comparable period"
                },
                "changePercentage": {
                  "type": "number",
                  "example": 27.6,
                  "description": "Percentage change from previous to current period. Positive = growth."
                },
                "trend": {
                  "type": "string",
                  "enum": ["up", "down", "neutral"],
                  "example": "up",
                  "description": "Direction of change"
                }
              },
              "required": ["current", "previous", "changePercentage", "trend"]
            },
            "pendingVerifications": {
              "type": "object",
              "properties": {
                "current": {
                  "type": "number",
                  "example": 74,
                  "description": "Value for the current period"
                },
                "previous": {
                  "type": "number",
                  "example": 58,
                  "description": "Value for the previous comparable period"
                },
                "changePercentage": {
                  "type": "number",
                  "example": 27.6,
                  "description": "Percentage change from previous to current period. Positive = growth."
                },
                "trend": {
                  "type": "string",
                  "enum": ["up", "down", "neutral"],
                  "example": "up",
                  "description": "Direction of change"
                }
              },
              "required": ["current", "previous", "changePercentage", "trend"]
            }
          },
          "required": [
            "totalLeads",
            "registeredAccounts",
            "depositingClients",
            "pendingVerifications"
          ]
        },
        "funnel": {
          "type": "object",
          "properties": {
            "new": {
              "type": "number",
              "example": 144,
              "description": "Leads in NEW status during the period"
            },
            "registered": {
              "type": "number",
              "example": 74,
              "description": "Leads in REGISTERED status during the period"
            },
            "depositReported": {
              "type": "number",
              "example": 39,
              "description": "Leads in DEPOSIT_REPORTED status during the period"
            },
            "depositConfirmed": {
              "type": "number",
              "example": 27,
              "description": "Leads in DEPOSIT_CONFIRMED status during the period"
            },
            "conversionRates": {
              "type": "object",
              "properties": {
                "newToRegistered": {
                  "type": "number",
                  "example": 51.4,
                  "description": "Percentage of NEW leads that became REGISTERED"
                },
                "registeredToReported": {
                  "type": "number",
                  "example": 52.6,
                  "description": "Percentage of REGISTERED leads that reported a deposit"
                },
                "reportedToConfirmed": {
                  "type": "number",
                  "example": 70,
                  "description": "Percentage of DEPOSIT_REPORTED leads that were confirmed"
                },
                "overall": {
                  "type": "number",
                  "example": 18.9,
                  "description": "End-to-end conversion: NEW → DEPOSIT_CONFIRMED"
                }
              },
              "required": [
                "newToRegistered",
                "registeredToReported",
                "reportedToConfirmed",
                "overall"
              ]
            }
          },
          "required": [
            "new",
            "registered",
            "depositReported",
            "depositConfirmed",
            "conversionRates"
          ]
        },
        "trendSeries": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "date": {
                "type": "string",
                "example": "2026-02-24T14:00",
                "description": "Bucket label: ISO datetime (YYYY-MM-DDTHH:mm) for hourly granularity, or date string (YYYY-MM-DD) for day/week/month granularity"
              },
              "newLeads": {
                "type": "number",
                "example": 18,
                "description": "New leads for this data point"
              },
              "registered": {
                "type": "number",
                "example": 9,
                "description": "Registered leads for this data point"
              },
              "confirmed": {
                "type": "number",
                "example": 3,
                "description": "Deposit-confirmed leads for this data point"
              }
            },
            "required": ["date", "newLeads", "registered", "confirmed"]
          }
        }
      },
      "required": ["kpi", "funnel", "trendSeries"]
    }
  }
}
```

<h3 id="analyticscontroller_getsummary-responses">Responses</h3>

| Status | Meaning                                                         | Description                              | Schema |
| ------ | --------------------------------------------------------------- | ---------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Analytics summary retrieved successfully | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT    | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role            | None   |

<h3 id="analyticscontroller_getsummary-responseschema">Response Schema</h3>

Status Code **200**

| Name                      | Type                                                              | Required | Restrictions | Description                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------- | -------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| » statusCode              | number                                                            | false    | none         | none                                                                                                                             |
| » message                 | string                                                            | false    | none         | none                                                                                                                             |
| » data                    | [AnalyticsSummaryResponseDto](#schemaanalyticssummaryresponsedto) | false    | none         | none                                                                                                                             |
| »» kpi                    | [AnalyticsKpiDto](#schemaanalyticskpidto)                         | true     | none         | none                                                                                                                             |
| »»» totalLeads            | [KpiStatDto](#schemakpistatdto)                                   | true     | none         | none                                                                                                                             |
| »»»» current              | number                                                            | true     | none         | Value for the current period                                                                                                     |
| »»»» previous             | number                                                            | true     | none         | Value for the previous comparable period                                                                                         |
| »»»» changePercentage     | number                                                            | true     | none         | Percentage change from previous to current period. Positive = growth.                                                            |
| »»»» trend                | string                                                            | true     | none         | Direction of change                                                                                                              |
| »»» registeredAccounts    | [KpiStatDto](#schemakpistatdto)                                   | true     | none         | none                                                                                                                             |
| »»» depositingClients     | [KpiStatDto](#schemakpistatdto)                                   | true     | none         | none                                                                                                                             |
| »»» pendingVerifications  | [KpiStatDto](#schemakpistatdto)                                   | true     | none         | none                                                                                                                             |
| »» funnel                 | [AnalyticsFunnelDto](#schemaanalyticsfunneldto)                   | true     | none         | none                                                                                                                             |
| »»» new                   | number                                                            | true     | none         | Leads in NEW status during the period                                                                                            |
| »»» registered            | number                                                            | true     | none         | Leads in REGISTERED status during the period                                                                                     |
| »»» depositReported       | number                                                            | true     | none         | Leads in DEPOSIT_REPORTED status during the period                                                                               |
| »»» depositConfirmed      | number                                                            | true     | none         | Leads in DEPOSIT_CONFIRMED status during the period                                                                              |
| »»» conversionRates       | [FunnelConversionRatesDto](#schemafunnelconversionratesdto)       | true     | none         | none                                                                                                                             |
| »»»» newToRegistered      | number                                                            | true     | none         | Percentage of NEW leads that became REGISTERED                                                                                   |
| »»»» registeredToReported | number                                                            | true     | none         | Percentage of REGISTERED leads that reported a deposit                                                                           |
| »»»» reportedToConfirmed  | number                                                            | true     | none         | Percentage of DEPOSIT_REPORTED leads that were confirmed                                                                         |
| »»»» overall              | number                                                            | true     | none         | End-to-end conversion: NEW → DEPOSIT_CONFIRMED                                                                                   |
| »» trendSeries            | [[TrendSeriesDataDto](#schematrendseriesdatadto)]                 | true     | none         | none                                                                                                                             |
| »»» date                  | string                                                            | true     | none         | Bucket label: ISO datetime (YYYY-MM-DDTHH:mm) for hourly granularity, or date string (YYYY-MM-DD) for day/week/month granularity |
| »»» newLeads              | number                                                            | true     | none         | New leads for this data point                                                                                                    |
| »»» registered            | number                                                            | true     | none         | Registered leads for this data point                                                                                             |
| »»» confirmed             | number                                                            | true     | none         | Deposit-confirmed leads for this data point                                                                                      |

#### Enumerated Values

| Property | Value   |
| -------- | ------- |
| trend    | up      |
| trend    | down    |
| trend    | neutral |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## AnalyticsController_getDashboardStats

<a id="opIdAnalyticsController_getDashboardStats"></a>

`GET /analytics/dashboard`

_Dashboard stats (Deprecated)_

Returns lead funnel counts. Use /analytics/summary instead.

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "totalLeads": {
          "type": "number",
          "example": 432,
          "description": "Total number of leads in the CRM"
        },
        "newLeads": {
          "type": "number",
          "example": 12,
          "description": "Leads in NEW status"
        },
        "registeredLeads": {
          "type": "number",
          "example": 85,
          "description": "Leads who have submitted registration proof"
        },
        "depositReported": {
          "type": "number",
          "example": 34,
          "description": "Leads who reported a deposit (DEPOSIT_REPORTED status)"
        },
        "depositConfirmed": {
          "type": "number",
          "example": 21,
          "description": "Leads whose deposit was confirmed by an Owner/Admin (DEPOSIT_CONFIRMED status)"
        },
        "recentStats": {
          "description": "Last 7 days of daily snapshot stats",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "description": "DailyStats record UUID"
              },
              "date": {
                "format": "date-time",
                "type": "string",
                "example": "2026-02-24T00:00:00.000Z",
                "description": "The UTC date this snapshot covers (midnight)"
              },
              "newLeads": {
                "type": "number",
                "example": 5,
                "description": "New leads that first messaged the bot on this date"
              },
              "registeredLeads": {
                "type": "number",
                "example": 3,
                "description": "Leads that moved to REGISTERED status on this date"
              },
              "depositReported": {
                "type": "number",
                "example": 2,
                "description": "Leads that reported a deposit on this date"
              },
              "conversions": {
                "type": "number",
                "example": 1,
                "description": "Deposits confirmed by an Owner/Admin on this date"
              },
              "tokensUsed": {
                "type": "number",
                "example": 4820,
                "description": "Total OpenAI tokens consumed on this date"
              },
              "totalLeads": {
                "type": "number",
                "example": 432,
                "description": "Running total of all leads at end of this date"
              },
              "createdAt": {
                "format": "date-time",
                "type": "string",
                "example": "2026-02-24T01:00:00.000Z",
                "description": "Record creation timestamp (usually 1 AM cron)"
              },
              "updatedAt": {
                "format": "date-time",
                "type": "string",
                "example": "2026-02-24T01:00:00.000Z"
              }
            },
            "required": [
              "id",
              "date",
              "newLeads",
              "registeredLeads",
              "depositReported",
              "conversions",
              "tokensUsed",
              "totalLeads",
              "createdAt",
              "updatedAt"
            ]
          }
        }
      },
      "required": [
        "totalLeads",
        "newLeads",
        "registeredLeads",
        "depositReported",
        "depositConfirmed",
        "recentStats"
      ]
    }
  }
}
```

<h3 id="analyticscontroller_getdashboardstats-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Dashboard stats retrieved             | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="analyticscontroller_getdashboardstats-responseschema">Response Schema</h3>

Status Code **200**

| Name                | Type                                                                  | Required | Restrictions | Description                                                                    |
| ------------------- | --------------------------------------------------------------------- | -------- | ------------ | ------------------------------------------------------------------------------ |
| » statusCode        | number                                                                | false    | none         | none                                                                           |
| » message           | string                                                                | false    | none         | none                                                                           |
| » data              | [AnalyticsDashboardResponseDto](#schemaanalyticsdashboardresponsedto) | false    | none         | none                                                                           |
| »» totalLeads       | number                                                                | true     | none         | Total number of leads in the CRM                                               |
| »» newLeads         | number                                                                | true     | none         | Leads in NEW status                                                            |
| »» registeredLeads  | number                                                                | true     | none         | Leads who have submitted registration proof                                    |
| »» depositReported  | number                                                                | true     | none         | Leads who reported a deposit (DEPOSIT_REPORTED status)                         |
| »» depositConfirmed | number                                                                | true     | none         | Leads whose deposit was confirmed by an Owner/Admin (DEPOSIT_CONFIRMED status) |
| »» recentStats      | [[DailyStatsResponseDto](#schemadailystatsresponsedto)]               | true     | none         | Last 7 days of daily snapshot stats                                            |
| »»» id              | string                                                                | true     | none         | DailyStats record UUID                                                         |
| »»» date            | string(date-time)                                                     | true     | none         | The UTC date this snapshot covers (midnight)                                   |
| »»» newLeads        | number                                                                | true     | none         | New leads that first messaged the bot on this date                             |
| »»» registeredLeads | number                                                                | true     | none         | Leads that moved to REGISTERED status on this date                             |
| »»» depositReported | number                                                                | true     | none         | Leads that reported a deposit on this date                                     |
| »»» conversions     | number                                                                | true     | none         | Deposits confirmed by an Owner/Admin on this date                              |
| »»» tokensUsed      | number                                                                | true     | none         | Total OpenAI tokens consumed on this date                                      |
| »»» totalLeads      | number                                                                | true     | none         | Running total of all leads at end of this date                                 |
| »»» createdAt       | string(date-time)                                                     | true     | none         | Record creation timestamp (usually 1 AM cron)                                  |
| »»» updatedAt       | string(date-time)                                                     | true     | none         | none                                                                           |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## AnalyticsController_getTodayStats

<a id="opIdAnalyticsController_getTodayStats"></a>

`GET /analytics/stats`

_Today's stats_

Returns today's aggregated stats. Returns null if daily stats haven't been computed yet.

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "DailyStats record UUID"
        },
        "date": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T00:00:00.000Z",
          "description": "The UTC date this snapshot covers (midnight)"
        },
        "newLeads": {
          "type": "number",
          "example": 5,
          "description": "New leads that first messaged the bot on this date"
        },
        "registeredLeads": {
          "type": "number",
          "example": 3,
          "description": "Leads that moved to REGISTERED status on this date"
        },
        "depositReported": {
          "type": "number",
          "example": 2,
          "description": "Leads that reported a deposit on this date"
        },
        "conversions": {
          "type": "number",
          "example": 1,
          "description": "Deposits confirmed by an Owner/Admin on this date"
        },
        "tokensUsed": {
          "type": "number",
          "example": 4820,
          "description": "Total OpenAI tokens consumed on this date"
        },
        "totalLeads": {
          "type": "number",
          "example": 432,
          "description": "Running total of all leads at end of this date"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T01:00:00.000Z",
          "description": "Record creation timestamp (usually 1 AM cron)"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T01:00:00.000Z"
        }
      },
      "required": [
        "id",
        "date",
        "newLeads",
        "registeredLeads",
        "depositReported",
        "conversions",
        "tokensUsed",
        "totalLeads",
        "createdAt",
        "updatedAt"
      ]
    }
  }
}
```

<h3 id="analyticscontroller_gettodaystats-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Today's stats retrieved               | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="analyticscontroller_gettodaystats-responseschema">Response Schema</h3>

Status Code **200**

| Name               | Type                                                  | Required | Restrictions | Description                                        |
| ------------------ | ----------------------------------------------------- | -------- | ------------ | -------------------------------------------------- |
| » statusCode       | number                                                | false    | none         | none                                               |
| » message          | string                                                | false    | none         | none                                               |
| » data             | [DailyStatsResponseDto](#schemadailystatsresponsedto) | false    | none         | none                                               |
| »» id              | string                                                | true     | none         | DailyStats record UUID                             |
| »» date            | string(date-time)                                     | true     | none         | The UTC date this snapshot covers (midnight)       |
| »» newLeads        | number                                                | true     | none         | New leads that first messaged the bot on this date |
| »» registeredLeads | number                                                | true     | none         | Leads that moved to REGISTERED status on this date |
| »» depositReported | number                                                | true     | none         | Leads that reported a deposit on this date         |
| »» conversions     | number                                                | true     | none         | Deposits confirmed by an Owner/Admin on this date  |
| »» tokensUsed      | number                                                | true     | none         | Total OpenAI tokens consumed on this date          |
| »» totalLeads      | number                                                | true     | none         | Running total of all leads at end of this date     |
| »» createdAt       | string(date-time)                                     | true     | none         | Record creation timestamp (usually 1 AM cron)      |
| »» updatedAt       | string(date-time)                                     | true     | none         | none                                               |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## AnalyticsController_getWeeklyStats

<a id="opIdAnalyticsController_getWeeklyStats"></a>

`GET /analytics/weekly`

_Weekly stats_

Returns new leads, registered leads, and deposits grouped by ISO week. Default: last 8 weeks.

<h3 id="analyticscontroller_getweeklystats-parameters">Parameters</h3>

| Name  | In    | Type   | Required | Description                                 |
| ----- | ----- | ------ | -------- | ------------------------------------------- |
| weeks | query | number | false    | Number of past weeks to include (default 8) |

> Example responses

> 200 Response

```json
{
  "properties": {
    "statusCode": {
      "type": "number",
      "example": 200
    },
    "message": {
      "type": "string",
      "example": "Request successful"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "weekStart": {
            "type": "string",
            "example": "2026-02-17",
            "description": "Monday of the ISO week (YYYY-MM-DD)"
          },
          "newLeads": {
            "type": "number",
            "example": 18,
            "description": "New leads that joined during this week"
          },
          "registeredLeads": {
            "type": "number",
            "example": 9,
            "description": "Leads that moved to REGISTERED during this week"
          },
          "depositReported": {
            "type": "number",
            "example": 5,
            "description": "Deposits reported during this week"
          },
          "depositConfirmed": {
            "type": "number",
            "example": 3,
            "description": "Deposits confirmed during this week"
          }
        },
        "required": [
          "weekStart",
          "newLeads",
          "registeredLeads",
          "depositReported",
          "depositConfirmed"
        ]
      }
    }
  }
}
```

<h3 id="analyticscontroller_getweeklystats-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Weekly stats retrieved                | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<h3 id="analyticscontroller_getweeklystats-responseschema">Response Schema</h3>

Status Code **200**

| Name                | Type                                                      | Required | Restrictions | Description                                     |
| ------------------- | --------------------------------------------------------- | -------- | ------------ | ----------------------------------------------- |
| » statusCode        | number                                                    | false    | none         | none                                            |
| » message           | string                                                    | false    | none         | none                                            |
| » data              | [[WeeklyStatsResponseDto](#schemaweeklystatsresponsedto)] | false    | none         | none                                            |
| »» weekStart        | string                                                    | true     | none         | Monday of the ISO week (YYYY-MM-DD)             |
| »» newLeads         | number                                                    | true     | none         | New leads that joined during this week          |
| »» registeredLeads  | number                                                    | true     | none         | Leads that moved to REGISTERED during this week |
| »» depositReported  | number                                                    | true     | none         | Deposits reported during this week              |
| »» depositConfirmed | number                                                    | true     | none         | Deposits confirmed during this week             |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## AnalyticsController_getRagStats

<a id="opIdAnalyticsController_getRagStats"></a>

`GET /analytics/rag-stats`

_RAG quality stats (SUPERADMIN)_

Hit rate, avg chunks, zero-hit count, token usage from last N auto-reply interactions.

<h3 id="analyticscontroller_getragstats-parameters">Parameters</h3>

| Name  | In    | Type   | Required | Description                                       |
| ----- | ----- | ------ | -------- | ------------------------------------------------- |
| limit | query | number | false    | Number of recent replies to analyse (default 500) |

<h3 id="analyticscontroller_getragstats-responses">Responses</h3>

| Status | Meaning                                                        | Description                   | Schema |
| ------ | -------------------------------------------------------------- | ----------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)        | RAG stats retrieved           | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3) | Forbidden – insufficient role | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="titan-journal-crm-api-follow-ups">follow-ups</h1>

## FollowUpController_findAll

<a id="opIdFollowUpController_findAll"></a>

`GET /follow-ups`

_List scheduled follow-up messages_

<h3 id="followupcontroller_findall-parameters">Parameters</h3>

| Name   | In    | Type   | Required | Description |
| ------ | ----- | ------ | -------- | ----------- |
| leadId | query | string | false    | none        |
| status | query | string | false    | none        |
| skip   | query | number | false    | none        |
| take   | query | number | false    | none        |

#### Enumerated Values

| Parameter | Value     |
| --------- | --------- |
| status    | pending   |
| status    | sent      |
| status    | cancelled |

<h3 id="followupcontroller_findall-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Follow-ups retrieved                  | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## FollowUpController_cancel

<a id="opIdFollowUpController_cancel"></a>

`DELETE /follow-ups/{id}`

_Cancel a scheduled follow-up by ID_

<h3 id="followupcontroller_cancel-parameters">Parameters</h3>

| Name | In   | Type         | Required | Description |
| ---- | ---- | ------------ | -------- | ----------- |
| id   | path | string(uuid) | true     | none        |

<h3 id="followupcontroller_cancel-responses">Responses</h3>

| Status | Meaning                                                         | Description         | Schema |
| ------ | --------------------------------------------------------------- | ------------------- | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5) | Follow-up cancelled | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | Resource not found  | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="titan-journal-crm-api-system-config">system-config</h1>

## SystemConfigController_getAllowlist

<a id="opIdSystemConfigController_getAllowlist"></a>

`GET /system-config/allowlist`

_List allowed config keys_

<h3 id="systemconfigcontroller_getallowlist-responses">Responses</h3>

| Status | Meaning                                                 | Description        | Schema |
| ------ | ------------------------------------------------------- | ------------------ | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | Allowlist returned | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## SystemConfigController_findAll

<a id="opIdSystemConfigController_findAll"></a>

`GET /system-config`

_List all system config entries_

<h3 id="systemconfigcontroller_findall-responses">Responses</h3>

| Status | Meaning                                                 | Description              | Schema |
| ------ | ------------------------------------------------------- | ------------------------ | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | Config entries retrieved | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## SystemConfigController_findOne

<a id="opIdSystemConfigController_findOne"></a>

`GET /system-config/{key}`

_Get a single config entry by key_

<h3 id="systemconfigcontroller_findone-parameters">Parameters</h3>

| Name | In   | Type   | Required | Description |
| ---- | ---- | ------ | -------- | ----------- |
| key  | path | string | true     | none        |

<h3 id="systemconfigcontroller_findone-responses">Responses</h3>

| Status | Meaning                                                        | Description            | Schema |
| ------ | -------------------------------------------------------------- | ---------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)        | Config entry retrieved | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4) | Resource not found     | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## SystemConfigController_upsert

<a id="opIdSystemConfigController_upsert"></a>

`PATCH /system-config/{key}`

_Upsert a config value (validated against allowlist)_

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "value": {
      "type": "string",
      "description": "Config value (raw string)",
      "example": "0.7"
    }
  },
  "required": ["value"]
}
```

<h3 id="systemconfigcontroller_upsert-parameters">Parameters</h3>

| Name    | In   | Type                                                  | Required | Description               |
| ------- | ---- | ----------------------------------------------------- | -------- | ------------------------- |
| key     | path | string                                                | true     | none                      |
| body    | body | [UpsertSystemConfigDto](#schemaupsertsystemconfigdto) | true     | none                      |
| » value | body | string                                                | true     | Config value (raw string) |

<h3 id="systemconfigcontroller_upsert-responses">Responses</h3>

| Status | Meaning                                                                  | Description       | Schema |
| ------ | ------------------------------------------------------------------------ | ----------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                  | Config updated    | None   |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## SystemConfigController_remove

<a id="opIdSystemConfigController_remove"></a>

`DELETE /system-config/{key}`

_Reset config key to env default (delete DB override)_

<h3 id="systemconfigcontroller_remove-parameters">Parameters</h3>

| Name | In   | Type   | Required | Description |
| ---- | ---- | ------ | -------- | ----------- |
| key  | path | string | true     | none        |

<h3 id="systemconfigcontroller_remove-responses">Responses</h3>

| Status | Meaning                                                                  | Description             | Schema |
| ------ | ------------------------------------------------------------------------ | ----------------------- | ------ |
| 204    | [No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)          | Config reset to default | None   |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed       | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="titan-journal-crm-api-audit-logs">audit-logs</h1>

## AuditLogController_findMany

<a id="opIdAuditLogController_findMany"></a>

`GET /audit-logs`

_Query audit log entries (SUPERADMIN only)_

<h3 id="auditlogcontroller_findmany-parameters">Parameters</h3>

| Name         | In    | Type   | Required | Description  |
| ------------ | ----- | ------ | -------- | ------------ |
| userId       | query | string | false    | none         |
| action       | query | string | false    | none         |
| resourceType | query | string | false    | none         |
| from         | query | string | false    | ISO8601 date |
| to           | query | string | false    | ISO8601 date |
| skip         | query | number | false    | none         |
| take         | query | number | false    | none         |

#### Enumerated Values

| Parameter | Value                 |
| --------- | --------------------- |
| action    | USER_CREATED          |
| action    | USER_DEACTIVATED      |
| action    | USER_REACTIVATED      |
| action    | USER_ROLE_CHANGED     |
| action    | PASSWORD_CHANGED      |
| action    | LEAD_STATUS_CHANGED   |
| action    | LEAD_VERIFIED         |
| action    | KB_CREATED            |
| action    | KB_UPDATED            |
| action    | KB_DELETED            |
| action    | COMMAND_MENU_CREATED  |
| action    | COMMAND_MENU_UPDATED  |
| action    | COMMAND_MENU_DELETED  |
| action    | SYSTEM_CONFIG_CHANGED |

<h3 id="auditlogcontroller_findmany-responses">Responses</h3>

| Status | Meaning                                                         | Description                           | Schema |
| ------ | --------------------------------------------------------------- | ------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Audit log entries                     | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized – invalid or missing JWT | None   |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Forbidden – insufficient role         | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="titan-journal-crm-api-activity">activity</h1>

## ActivityController_stream

<a id="opIdActivityController_stream"></a>

`GET /activity/stream`

_Real-time activity feed (SSE)_

Server-Sent Events stream. Connect with EventSource. Keepalive ping every 30s.

<h3 id="activitycontroller_stream-parameters">Parameters</h3>

| Name  | In    | Type | Required | Description                                                        |
| ----- | ----- | ---- | -------- | ------------------------------------------------------------------ |
| token | query | any  | false    | Bearer token (alternative to Authorization header for EventSource) |

<h3 id="activitycontroller_stream-responses">Responses</h3>

| Status | Meaning                                                 | Description       | Schema |
| ------ | ------------------------------------------------------- | ----------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | text/event-stream | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="titan-journal-crm-api-ai-feedback">ai-feedback</h1>

## FeedbackController_create

<a id="opIdFeedbackController_create"></a>

`POST /ai/feedback`

_Submit conversation feedback (rate a bot reply)_

> Body parameter

```json
{
  "type": "object",
  "properties": {
    "leadId": {
      "type": "string",
      "description": "Lead UUID this conversation belongs to"
    },
    "userMessage": {
      "type": "string",
      "description": "The user message being rated"
    },
    "botReply": {
      "type": "string",
      "description": "The bot reply being rated"
    },
    "rating": {
      "type": "number",
      "description": "1 = bad, 5 = good",
      "enum": [1, 5]
    },
    "notes": {
      "type": "string",
      "description": "Optional notes about why this is good/bad"
    }
  },
  "required": ["leadId", "userMessage", "botReply", "rating"]
}
```

<h3 id="feedbackcontroller_create-parameters">Parameters</h3>

| Name          | In   | Type                                          | Required | Description                               |
| ------------- | ---- | --------------------------------------------- | -------- | ----------------------------------------- |
| body          | body | [CreateFeedbackDto](#schemacreatefeedbackdto) | true     | none                                      |
| » leadId      | body | string                                        | true     | Lead UUID this conversation belongs to    |
| » userMessage | body | string                                        | true     | The user message being rated              |
| » botReply    | body | string                                        | true     | The bot reply being rated                 |
| » rating      | body | number                                        | true     | 1 = bad, 5 = good                         |
| » notes       | body | string                                        | false    | Optional notes about why this is good/bad |

#### Enumerated Values

| Parameter | Value |
| --------- | ----- |
| » rating  | 1     |
| » rating  | 5     |

<h3 id="feedbackcontroller_create-responses">Responses</h3>

| Status | Meaning                                                                  | Description       | Schema |
| ------ | ------------------------------------------------------------------------ | ----------------- | ------ |
| 201    | [Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)             | Feedback recorded | None   |
| 422    | [Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3) | Validation failed | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## FeedbackController_findMany

<a id="opIdFeedbackController_findMany"></a>

`GET /ai/feedback`

_List feedback entries (SUPERADMIN)_

<h3 id="feedbackcontroller_findmany-parameters">Parameters</h3>

| Name   | In    | Type   | Required | Description |
| ------ | ----- | ------ | -------- | ----------- |
| rating | query | number | false    | none        |
| skip   | query | number | false    | none        |
| take   | query | number | false    | none        |

#### Enumerated Values

| Parameter | Value |
| --------- | ----- |
| rating    | 1     |
| rating    | 5     |

<h3 id="feedbackcontroller_findmany-responses">Responses</h3>

| Status | Meaning                                                 | Description                | Schema |
| ------ | ------------------------------------------------------- | -------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | Feedback entries retrieved | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## FeedbackController_toggleFewShot

<a id="opIdFeedbackController_toggleFewShot"></a>

`PATCH /ai/feedback/{id}/few-shot`

_Toggle usedAsFewShot on a feedback entry (SUPERADMIN)_

<h3 id="feedbackcontroller_togglefewshot-parameters">Parameters</h3>

| Name   | In    | Type   | Required | Description |
| ------ | ----- | ------ | -------- | ----------- |
| id     | path  | string | true     | none        |
| enable | query | string | true     | none        |

<h3 id="feedbackcontroller_togglefewshot-responses">Responses</h3>

| Status | Meaning                                                        | Description           | Schema |
| ------ | -------------------------------------------------------------- | --------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)        | Few-shot flag updated | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4) | Resource not found    | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

# Schemas

<h2 id="tocS_UserResponseDto">UserResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemauserresponsedto"></a>
<a id="schema_UserResponseDto"></a>
<a id="tocSuserresponsedto"></a>
<a id="tocsuserresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "description": "User UUID"
    },
    "email": {
      "type": "string",
      "example": "superadmin@yopmail.com",
      "description": "User email address"
    },
    "role": {
      "type": "string",
      "example": "ADMIN",
      "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
      "description": "RBAC role"
    },
    "isActive": {
      "type": "boolean",
      "example": true,
      "description": "Whether this account is active and can log in"
    },
    "telegramId": {
      "type": "object",
      "example": "987654321",
      "nullable": true,
      "description": "Telegram user ID linked for TMA login. Null if not linked."
    },
    "lastLoginAt": {
      "type": "object",
      "example": "2026-02-24T08:30:00.000Z",
      "nullable": true,
      "description": "Timestamp of last successful login"
    },
    "lastIpAddress": {
      "type": "object",
      "example": "103.10.20.5",
      "nullable": true,
      "description": "IP address from the last login"
    },
    "createdAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-01-15T10:00:00.000Z",
      "description": "Account creation timestamp"
    },
    "updatedAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-24T08:30:00.000Z",
      "description": "Last profile update timestamp"
    }
  },
  "required": [
    "id",
    "email",
    "role",
    "isActive",
    "telegramId",
    "lastLoginAt",
    "lastIpAddress",
    "createdAt",
    "updatedAt"
  ]
}
```

### Properties

| Name          | Type              | Required | Restrictions | Description                                                |
| ------------- | ----------------- | -------- | ------------ | ---------------------------------------------------------- |
| id            | string            | true     | none         | User UUID                                                  |
| email         | string            | true     | none         | User email address                                         |
| role          | string            | true     | none         | RBAC role                                                  |
| isActive      | boolean           | true     | none         | Whether this account is active and can log in              |
| telegramId    | object¦null       | true     | none         | Telegram user ID linked for TMA login. Null if not linked. |
| lastLoginAt   | object¦null       | true     | none         | Timestamp of last successful login                         |
| lastIpAddress | object¦null       | true     | none         | IP address from the last login                             |
| createdAt     | string(date-time) | true     | none         | Account creation timestamp                                 |
| updatedAt     | string(date-time) | true     | none         | Last profile update timestamp                              |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<h2 id="tocS_AuthResponseDto">AuthResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemaauthresponsedto"></a>
<a id="schema_AuthResponseDto"></a>
<a id="tocSauthresponsedto"></a>
<a id="tocsauthresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "accessToken": {
      "type": "string",
      "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "description": "Short-lived JWT access token (15 min). Send as Authorization: Bearer <token>"
    },
    "user": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "description": "User UUID"
        },
        "email": {
          "type": "string",
          "example": "superadmin@yopmail.com",
          "description": "User email address"
        },
        "role": {
          "type": "string",
          "example": "ADMIN",
          "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
          "description": "RBAC role"
        },
        "isActive": {
          "type": "boolean",
          "example": true,
          "description": "Whether this account is active and can log in"
        },
        "telegramId": {
          "type": "object",
          "example": "987654321",
          "nullable": true,
          "description": "Telegram user ID linked for TMA login. Null if not linked."
        },
        "lastLoginAt": {
          "type": "object",
          "example": "2026-02-24T08:30:00.000Z",
          "nullable": true,
          "description": "Timestamp of last successful login"
        },
        "lastIpAddress": {
          "type": "object",
          "example": "103.10.20.5",
          "nullable": true,
          "description": "IP address from the last login"
        },
        "createdAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-01-15T10:00:00.000Z",
          "description": "Account creation timestamp"
        },
        "updatedAt": {
          "format": "date-time",
          "type": "string",
          "example": "2026-02-24T08:30:00.000Z",
          "description": "Last profile update timestamp"
        }
      },
      "required": [
        "id",
        "email",
        "role",
        "isActive",
        "telegramId",
        "lastLoginAt",
        "lastIpAddress",
        "createdAt",
        "updatedAt"
      ]
    }
  },
  "required": ["accessToken", "user"]
}
```

### Properties

| Name        | Type                                      | Required | Restrictions | Description                                                                  |
| ----------- | ----------------------------------------- | -------- | ------------ | ---------------------------------------------------------------------------- |
| accessToken | string                                    | true     | none         | Short-lived JWT access token (15 min). Send as Authorization: Bearer <token> |
| user        | [UserResponseDto](#schemauserresponsedto) | true     | none         | none                                                                         |

<h2 id="tocS_SessionResponseDto">SessionResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemasessionresponsedto"></a>
<a id="schema_SessionResponseDto"></a>
<a id="tocSsessionresponsedto"></a>
<a id="tocssessionresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "description": "Session UUID"
    },
    "deviceId": {
      "type": "object",
      "example": "device-uuid-v4",
      "nullable": true,
      "description": "Unique device identifier"
    },
    "userAgent": {
      "type": "object",
      "example": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
      "nullable": true,
      "description": "Browser/app user agent string"
    },
    "ipAddress": {
      "type": "object",
      "example": "103.10.20.5",
      "nullable": true,
      "description": "Last known IP address for this session"
    },
    "lastActiveAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-24T09:00:00.000Z",
      "description": "Timestamp of last API activity"
    },
    "createdAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-24T08:00:00.000Z",
      "description": "When this session was created"
    },
    "expiresAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-03-03T08:00:00.000Z",
      "description": "When the refresh token expires (7 days from creation)"
    },
    "isRevoked": {
      "type": "boolean",
      "example": false,
      "description": "True if this session has been manually revoked"
    }
  },
  "required": [
    "id",
    "deviceId",
    "userAgent",
    "ipAddress",
    "lastActiveAt",
    "createdAt",
    "expiresAt",
    "isRevoked"
  ]
}
```

### Properties

| Name         | Type              | Required | Restrictions | Description                                           |
| ------------ | ----------------- | -------- | ------------ | ----------------------------------------------------- |
| id           | string            | true     | none         | Session UUID                                          |
| deviceId     | object¦null       | true     | none         | Unique device identifier                              |
| userAgent    | object¦null       | true     | none         | Browser/app user agent string                         |
| ipAddress    | object¦null       | true     | none         | Last known IP address for this session                |
| lastActiveAt | string(date-time) | true     | none         | Timestamp of last API activity                        |
| createdAt    | string(date-time) | true     | none         | When this session was created                         |
| expiresAt    | string(date-time) | true     | none         | When the refresh token expires (7 days from creation) |
| isRevoked    | boolean           | true     | none         | True if this session has been manually revoked        |

<h2 id="tocS_LoginDto">LoginDto</h2>
<!-- backwards compatibility -->
<a id="schemalogindto"></a>
<a id="schema_LoginDto"></a>
<a id="tocSlogindto"></a>
<a id="tocslogindto"></a>

```json
{
  "type": "object",
  "properties": {
    "initData": {
      "type": "string",
      "description": "Telegram WebApp initData from window.Telegram.WebApp.initData. Present when running inside a Telegram Mini App. Send even if empty — backend auto-detects the context.",
      "example": "query_id=AAHd...&user=%7B%22id%22%3A123456789%7D&auth_date=1708768000&hash=abc123"
    },
    "email": {
      "type": "string",
      "example": "admin@crm.com",
      "description": "User email address. Required when initData is absent."
    },
    "password": {
      "type": "string",
      "example": "P@ssw0rd!",
      "minLength": 8,
      "description": "User password. Required when initData is absent."
    },
    "deviceId": {
      "type": "string",
      "example": "device-uuid-v4"
    },
    "userAgent": {
      "type": "string",
      "example": "Mozilla/5.0 ..."
    }
  }
}
```

### Properties

| Name      | Type   | Required | Restrictions | Description                                                                                                                                                            |
| --------- | ------ | -------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| initData  | string | false    | none         | Telegram WebApp initData from window.Telegram.WebApp.initData. Present when running inside a Telegram Mini App. Send even if empty — backend auto-detects the context. |
| email     | string | false    | none         | User email address. Required when initData is absent.                                                                                                                  |
| password  | string | false    | none         | User password. Required when initData is absent.                                                                                                                       |
| deviceId  | string | false    | none         | none                                                                                                                                                                   |
| userAgent | string | false    | none         | none                                                                                                                                                                   |

<h2 id="tocS_SetupAccountDto">SetupAccountDto</h2>
<!-- backwards compatibility -->
<a id="schemasetupaccountdto"></a>
<a id="schema_SetupAccountDto"></a>
<a id="tocSsetupaccountdto"></a>
<a id="tocssetupaccountdto"></a>

```json
{
  "type": "object",
  "properties": {
    "invitationToken": {
      "type": "string",
      "description": "Invitation token starting with inv_ received via Telegram deep link",
      "example": "inv_abc123"
    },
    "initData": {
      "type": "string",
      "description": "Telegram WebApp initData string from window.Telegram.WebApp.initData. Required when setup is done inside a Telegram Mini App. When the setup URL is opened in a regular browser after clicking the Telegram deep link, the telegramId is automatically retrieved from the server (recorded when you opened the invite link in Telegram).",
      "example": "query_id=AAHd...&user=%7B%22id%22%3A123456789%7D&auth_date=1708768000&hash=abc123"
    },
    "email": {
      "type": "string",
      "example": "newuser@crm.com",
      "description": "Email to set for this new account"
    },
    "password": {
      "type": "string",
      "example": "P@ssw0rd!",
      "minLength": 8,
      "description": "Password to set (min 8 characters)"
    },
    "deviceId": {
      "type": "string",
      "example": "device-uuid-v4",
      "description": "Unique device identifier for session tracking"
    },
    "userAgent": {
      "type": "string",
      "example": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
      "description": "Device user agent string"
    }
  },
  "required": ["invitationToken", "email", "password"]
}
```

### Properties

| Name            | Type   | Required | Restrictions | Description                                                                                                                                                                                                                                                                                                                              |
| --------------- | ------ | -------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| invitationToken | string | true     | none         | Invitation token starting with inv\_ received via Telegram deep link                                                                                                                                                                                                                                                                     |
| initData        | string | false    | none         | Telegram WebApp initData string from window.Telegram.WebApp.initData. Required when setup is done inside a Telegram Mini App. When the setup URL is opened in a regular browser after clicking the Telegram deep link, the telegramId is automatically retrieved from the server (recorded when you opened the invite link in Telegram). |
| email           | string | true     | none         | Email to set for this new account                                                                                                                                                                                                                                                                                                        |
| password        | string | true     | none         | Password to set (min 8 characters)                                                                                                                                                                                                                                                                                                       |
| deviceId        | string | false    | none         | Unique device identifier for session tracking                                                                                                                                                                                                                                                                                            |
| userAgent       | string | false    | none         | Device user agent string                                                                                                                                                                                                                                                                                                                 |

<h2 id="tocS_ForgotPasswordDto">ForgotPasswordDto</h2>
<!-- backwards compatibility -->
<a id="schemaforgotpassworddto"></a>
<a id="schema_ForgotPasswordDto"></a>
<a id="tocSforgotpassworddto"></a>
<a id="tocsforgotpassworddto"></a>

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "example": "admin@crm.com",
      "description": "Account email address"
    }
  },
  "required": ["email"]
}
```

### Properties

| Name  | Type   | Required | Restrictions | Description           |
| ----- | ------ | -------- | ------------ | --------------------- |
| email | string | true     | none         | Account email address |

<h2 id="tocS_ResetPasswordDto">ResetPasswordDto</h2>
<!-- backwards compatibility -->
<a id="schemaresetpassworddto"></a>
<a id="schema_ResetPasswordDto"></a>
<a id="tocSresetpassworddto"></a>
<a id="tocsresetpassworddto"></a>

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "example": "admin@crm.com",
      "description": "Account email address"
    },
    "code": {
      "type": "string",
      "example": "4821",
      "description": "4-digit OTP sent to your email",
      "minLength": 4,
      "maxLength": 4
    },
    "newPassword": {
      "type": "string",
      "example": "N3wP@ssword!",
      "minLength": 8,
      "description": "New password (min 8 characters)"
    }
  },
  "required": ["email", "code", "newPassword"]
}
```

### Properties

| Name        | Type   | Required | Restrictions | Description                     |
| ----------- | ------ | -------- | ------------ | ------------------------------- |
| email       | string | true     | none         | Account email address           |
| code        | string | true     | none         | 4-digit OTP sent to your email  |
| newPassword | string | true     | none         | New password (min 8 characters) |

<h2 id="tocS_ChangeOwnPasswordDto">ChangeOwnPasswordDto</h2>
<!-- backwards compatibility -->
<a id="schemachangeownpassworddto"></a>
<a id="schema_ChangeOwnPasswordDto"></a>
<a id="tocSchangeownpassworddto"></a>
<a id="tocschangeownpassworddto"></a>

```json
{
  "type": "object",
  "properties": {
    "currentPassword": {
      "type": "string",
      "description": "Your current password",
      "example": "P@ssw0rd!"
    },
    "newPassword": {
      "type": "string",
      "example": "N3wP@ssword!",
      "minLength": 8,
      "description": "New password (min 8 characters)"
    },
    "confirmPassword": {
      "type": "string",
      "description": "Repeat new password — must match newPassword",
      "example": "N3wP@ssword!"
    }
  },
  "required": ["currentPassword", "newPassword", "confirmPassword"]
}
```

### Properties

| Name            | Type   | Required | Restrictions | Description                                  |
| --------------- | ------ | -------- | ------------ | -------------------------------------------- |
| currentPassword | string | true     | none         | Your current password                        |
| newPassword     | string | true     | none         | New password (min 8 characters)              |
| confirmPassword | string | true     | none         | Repeat new password — must match newPassword |

<h2 id="tocS_InvitationResponseDto">InvitationResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemainvitationresponsedto"></a>
<a id="schema_InvitationResponseDto"></a>
<a id="tocSinvitationresponsedto"></a>
<a id="tocsinvitationresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "description": "Invitation UUID"
    },
    "role": {
      "type": "string",
      "example": "STAFF",
      "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
      "description": "Role that will be assigned upon account setup"
    },
    "email": {
      "type": "object",
      "example": "newstaff@crm.com",
      "nullable": true,
      "description": "Pre-filled email (if provided during invite creation)"
    },
    "telegramDeepLink": {
      "type": "string",
      "example": "https://t.me/YourBot?start=inv_abc123",
      "description": "Telegram deep link the invited user must open. Embeds the invitation token."
    },
    "expiresAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-31T10:00:00.000Z",
      "description": "Invitation expires 7 days after creation. Invalid after this timestamp."
    },
    "createdAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-24T10:00:00.000Z"
    }
  },
  "required": [
    "id",
    "role",
    "email",
    "telegramDeepLink",
    "expiresAt",
    "createdAt"
  ]
}
```

### Properties

| Name             | Type              | Required | Restrictions | Description                                                                 |
| ---------------- | ----------------- | -------- | ------------ | --------------------------------------------------------------------------- |
| id               | string            | true     | none         | Invitation UUID                                                             |
| role             | string            | true     | none         | Role that will be assigned upon account setup                               |
| email            | object¦null       | true     | none         | Pre-filled email (if provided during invite creation)                       |
| telegramDeepLink | string            | true     | none         | Telegram deep link the invited user must open. Embeds the invitation token. |
| expiresAt        | string(date-time) | true     | none         | Invitation expires 7 days after creation. Invalid after this timestamp.     |
| createdAt        | string(date-time) | true     | none         | none                                                                        |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<h2 id="tocS_ChangePasswordDto">ChangePasswordDto</h2>
<!-- backwards compatibility -->
<a id="schemachangepassworddto"></a>
<a id="schema_ChangePasswordDto"></a>
<a id="tocSchangepassworddto"></a>
<a id="tocschangepassworddto"></a>

```json
{
  "type": "object",
  "properties": {
    "newPassword": {
      "type": "string"
    }
  },
  "required": ["newPassword"]
}
```

### Properties

| Name        | Type   | Required | Restrictions | Description |
| ----------- | ------ | -------- | ------------ | ----------- |
| newPassword | string | true     | none         | none        |

<h2 id="tocS_InviteUserDto">InviteUserDto</h2>
<!-- backwards compatibility -->
<a id="schemainviteuserdto"></a>
<a id="schema_InviteUserDto"></a>
<a id="tocSinviteuserdto"></a>
<a id="tocsinviteuserdto"></a>

```json
{
  "type": "object",
  "properties": {
    "role": {
      "type": "string",
      "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
      "example": "STAFF",
      "description": "Role to assign to the invited user"
    },
    "email": {
      "type": "string",
      "example": "newstaff@crm.com",
      "description": "Pre-fill email for the invited user (optional). They can set it during setup."
    }
  },
  "required": ["role"]
}
```

### Properties

| Name  | Type   | Required | Restrictions | Description                                                                   |
| ----- | ------ | -------- | ------------ | ----------------------------------------------------------------------------- |
| role  | string | true     | none         | Role to assign to the invited user                                            |
| email | string | false    | none         | Pre-fill email for the invited user (optional). They can set it during setup. |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<h2 id="tocS_ChangeRoleDto">ChangeRoleDto</h2>
<!-- backwards compatibility -->
<a id="schemachangeroledto"></a>
<a id="schema_ChangeRoleDto"></a>
<a id="tocSchangeroledto"></a>
<a id="tocschangeroledto"></a>

```json
{
  "type": "object",
  "properties": {
    "role": {
      "type": "string",
      "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
      "example": "ADMIN",
      "description": "New role to assign to the user"
    }
  },
  "required": ["role"]
}
```

### Properties

| Name | Type   | Required | Restrictions | Description                    |
| ---- | ------ | -------- | ------------ | ------------------------------ |
| role | string | true     | none         | New role to assign to the user |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<h2 id="tocS_CreateUserDto">CreateUserDto</h2>
<!-- backwards compatibility -->
<a id="schemacreateuserdto"></a>
<a id="schema_CreateUserDto"></a>
<a id="tocScreateuserdto"></a>
<a id="tocscreateuserdto"></a>

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "example": "staff@crm.com",
      "description": "Email address for login"
    },
    "password": {
      "type": "string",
      "example": "P@ssw0rd!",
      "minLength": 8,
      "description": "Initial password (min 8 characters)"
    },
    "role": {
      "type": "string",
      "enum": ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"],
      "example": "STAFF",
      "description": "RBAC role to assign to this user"
    }
  },
  "required": ["email", "password", "role"]
}
```

### Properties

| Name     | Type   | Required | Restrictions | Description                         |
| -------- | ------ | -------- | ------------ | ----------------------------------- |
| email    | string | true     | none         | Email address for login             |
| password | string | true     | none         | Initial password (min 8 characters) |
| role     | string | true     | none         | RBAC role to assign to this user    |

#### Enumerated Values

| Property | Value      |
| -------- | ---------- |
| role     | SUPERADMIN |
| role     | OWNER      |
| role     | ADMIN      |
| role     | STAFF      |

<h2 id="tocS_LeadResponseDto">LeadResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemaleadresponsedto"></a>
<a id="schema_LeadResponseDto"></a>
<a id="tocSleadresponsedto"></a>
<a id="tocsleadresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "description": "Lead UUID"
    },
    "telegramUserId": {
      "type": "string",
      "example": "123456789",
      "description": "Telegram user ID (serialised as string due to BigInt)"
    },
    "username": {
      "type": "object",
      "example": "john_doe",
      "nullable": true,
      "description": "Telegram @username without @"
    },
    "displayName": {
      "type": "object",
      "example": "John Doe",
      "nullable": true,
      "description": "Telegram display name"
    },
    "status": {
      "type": "string",
      "example": "NEW",
      "enum": [
        "NEW",
        "CONTACTED",
        "REGISTERED",
        "DEPOSIT_REPORTED",
        "DEPOSIT_CONFIRMED",
        "REJECTED"
      ],
      "description": "Current CRM lead status"
    },
    "hfmBrokerId": {
      "type": "object",
      "example": "HFM-123456",
      "nullable": true,
      "description": "HFM broker account ID submitted by the lead"
    },
    "email": {
      "type": "object",
      "example": "lead@example.com",
      "nullable": true,
      "description": "Email address submitted by the lead"
    },
    "phoneNumber": {
      "type": "object",
      "example": "+60123456789",
      "nullable": true,
      "description": "Phone number submitted by the lead"
    },
    "depositBalance": {
      "type": "object",
      "example": "500.00",
      "nullable": true,
      "description": "Lifetime deposit balance as decimal string (Prisma Decimal serialised)"
    },
    "registeredAt": {
      "type": "object",
      "example": "2026-02-20T10:00:00.000Z",
      "nullable": true,
      "description": "When the lead submitted registration proof"
    },
    "verifiedAt": {
      "type": "object",
      "example": "2026-02-21T12:00:00.000Z",
      "nullable": true,
      "description": "When an Owner/Admin verified the lead"
    },
    "handoverMode": {
      "type": "boolean",
      "example": false,
      "description": "When true the bot hands off to a human agent; bot stops auto-replying"
    },
    "createdAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-18T08:00:00.000Z",
      "description": "When the lead first messaged the bot"
    },
    "updatedAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-24T09:00:00.000Z",
      "description": "Last time any lead field was updated"
    }
  },
  "required": [
    "id",
    "telegramUserId",
    "username",
    "displayName",
    "status",
    "hfmBrokerId",
    "email",
    "phoneNumber",
    "depositBalance",
    "registeredAt",
    "verifiedAt",
    "handoverMode",
    "createdAt",
    "updatedAt"
  ]
}
```

### Properties

| Name           | Type              | Required | Restrictions | Description                                                            |
| -------------- | ----------------- | -------- | ------------ | ---------------------------------------------------------------------- |
| id             | string            | true     | none         | Lead UUID                                                              |
| telegramUserId | string            | true     | none         | Telegram user ID (serialised as string due to BigInt)                  |
| username       | object¦null       | true     | none         | Telegram @username without @                                           |
| displayName    | object¦null       | true     | none         | Telegram display name                                                  |
| status         | string            | true     | none         | Current CRM lead status                                                |
| hfmBrokerId    | object¦null       | true     | none         | HFM broker account ID submitted by the lead                            |
| email          | object¦null       | true     | none         | Email address submitted by the lead                                    |
| phoneNumber    | object¦null       | true     | none         | Phone number submitted by the lead                                     |
| depositBalance | object¦null       | true     | none         | Lifetime deposit balance as decimal string (Prisma Decimal serialised) |
| registeredAt   | object¦null       | true     | none         | When the lead submitted registration proof                             |
| verifiedAt     | object¦null       | true     | none         | When an Owner/Admin verified the lead                                  |
| handoverMode   | boolean           | true     | none         | When true the bot hands off to a human agent; bot stops auto-replying  |
| createdAt      | string(date-time) | true     | none         | When the lead first messaged the bot                                   |
| updatedAt      | string(date-time) | true     | none         | Last time any lead field was updated                                   |

#### Enumerated Values

| Property | Value             |
| -------- | ----------------- |
| status   | NEW               |
| status   | CONTACTED         |
| status   | REGISTERED        |
| status   | DEPOSIT_REPORTED  |
| status   | DEPOSIT_CONFIRMED |
| status   | REJECTED          |

<h2 id="tocS_SubmitLeadInfoDto">SubmitLeadInfoDto</h2>
<!-- backwards compatibility -->
<a id="schemasubmitleadinfodto"></a>
<a id="schema_SubmitLeadInfoDto"></a>
<a id="tocSsubmitleadinfodto"></a>
<a id="tocssubmitleadinfodto"></a>

```json
{
  "type": "object",
  "properties": {
    "telegramUserId": {
      "type": "number",
      "example": 123456789,
      "description": "Telegram user ID of the lead"
    },
    "email": {
      "type": "string",
      "example": "lead@example.com"
    },
    "hfmBrokerId": {
      "type": "string",
      "example": "HFM-123456",
      "description": "HFM broker account ID"
    },
    "phoneNumber": {
      "type": "string",
      "example": "+60123456789",
      "description": "Lead's phone number (No. Fon)"
    },
    "depositBalance": {
      "type": "string",
      "example": "500.00",
      "description": "Deposit or balance amount (decimal string)"
    },
    "registeredAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-22T10:00:00Z",
      "description": "When the lead submitted their registration"
    }
  },
  "required": ["telegramUserId"]
}
```

### Properties

| Name           | Type              | Required | Restrictions | Description                                |
| -------------- | ----------------- | -------- | ------------ | ------------------------------------------ |
| telegramUserId | number            | true     | none         | Telegram user ID of the lead               |
| email          | string            | false    | none         | none                                       |
| hfmBrokerId    | string            | false    | none         | HFM broker account ID                      |
| phoneNumber    | string            | false    | none         | Lead's phone number (No. Fon)              |
| depositBalance | string            | false    | none         | Deposit or balance amount (decimal string) |
| registeredAt   | string(date-time) | false    | none         | When the lead submitted their registration |

<h2 id="tocS_BulkHandoverDto">BulkHandoverDto</h2>
<!-- backwards compatibility -->
<a id="schemabulkhandoverdto"></a>
<a id="schema_BulkHandoverDto"></a>
<a id="tocSbulkhandoverdto"></a>
<a id="tocsbulkhandoverdto"></a>

```json
{
  "type": "object",
  "properties": {
    "handoverMode": {
      "type": "boolean",
      "example": true,
      "description": "Enable (true) or disable (false) handover mode for all leads"
    }
  },
  "required": ["handoverMode"]
}
```

### Properties

| Name         | Type    | Required | Restrictions | Description                                                  |
| ------------ | ------- | -------- | ------------ | ------------------------------------------------------------ |
| handoverMode | boolean | true     | none         | Enable (true) or disable (false) handover mode for all leads |

<h2 id="tocS_UpdateLeadStatusDto">UpdateLeadStatusDto</h2>
<!-- backwards compatibility -->
<a id="schemaupdateleadstatusdto"></a>
<a id="schema_UpdateLeadStatusDto"></a>
<a id="tocSupdateleadstatusdto"></a>
<a id="tocsupdateleadstatusdto"></a>

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "NEW",
        "CONTACTED",
        "REGISTERED",
        "DEPOSIT_REPORTED",
        "DEPOSIT_CONFIRMED"
      ],
      "example": "CONTACTED",
      "description": "New lead status"
    }
  },
  "required": ["status"]
}
```

### Properties

| Name   | Type   | Required | Restrictions | Description     |
| ------ | ------ | -------- | ------------ | --------------- |
| status | string | true     | none         | New lead status |

#### Enumerated Values

| Property | Value             |
| -------- | ----------------- |
| status   | NEW               |
| status   | CONTACTED         |
| status   | REGISTERED        |
| status   | DEPOSIT_REPORTED  |
| status   | DEPOSIT_CONFIRMED |

<h2 id="tocS_UpdateHandoverDto">UpdateHandoverDto</h2>
<!-- backwards compatibility -->
<a id="schemaupdatehandoverdto"></a>
<a id="schema_UpdateHandoverDto"></a>
<a id="tocSupdatehandoverdto"></a>
<a id="tocsupdatehandoverdto"></a>

```json
{
  "type": "object",
  "properties": {
    "handoverMode": {
      "type": "boolean",
      "example": true,
      "description": "Enable (true) or disable (false) handover mode"
    }
  },
  "required": ["handoverMode"]
}
```

### Properties

| Name         | Type    | Required | Restrictions | Description                                    |
| ------------ | ------- | -------- | ------------ | ---------------------------------------------- |
| handoverMode | boolean | true     | none         | Enable (true) or disable (false) handover mode |

<h2 id="tocS_KbResponseDto">KbResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemakbresponsedto"></a>
<a id="schema_KbResponseDto"></a>
<a id="tocSkbresponsedto"></a>
<a id="tocskbresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "description": "Knowledge base entry UUID"
    },
    "title": {
      "type": "string",
      "example": "How to Register on HFM",
      "description": "Entry title shown in the CRM and used as RAG context heading"
    },
    "content": {
      "type": "string",
      "example": "To register a new trading account, visit https://hfm.com and click...",
      "description": "Full text content (used for vector embedding)"
    },
    "type": {
      "type": "string",
      "enum": ["TEXT", "LINK", "TEMPLATE"],
      "example": "TEXT",
      "description": "TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template"
    },
    "fileType": {
      "type": "string",
      "enum": [
        "TEXT_MANUAL",
        "PDF",
        "DOCX",
        "IMAGE",
        "VIDEO_LINK",
        "EXTERNAL_LINK"
      ],
      "example": "TEXT_MANUAL",
      "description": "How the content was ingested"
    },
    "url": {
      "type": "object",
      "example": "https://drive.google.com/file/d/xyz",
      "nullable": true,
      "description": "External URL for LINK or TEMPLATE entries"
    },
    "status": {
      "type": "string",
      "enum": ["PENDING", "PROCESSING", "READY", "FAILED"],
      "example": "READY",
      "description": "Processing status — only READY entries are used by the RAG pipeline"
    },
    "isActive": {
      "type": "boolean",
      "example": true,
      "description": "Inactive entries are excluded from vector search"
    },
    "createdAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-20T10:00:00.000Z"
    },
    "updatedAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-24T08:00:00.000Z"
    }
  },
  "required": [
    "id",
    "title",
    "content",
    "type",
    "fileType",
    "status",
    "isActive",
    "createdAt",
    "updatedAt"
  ]
}
```

### Properties

| Name      | Type              | Required | Restrictions | Description                                                                 |
| --------- | ----------------- | -------- | ------------ | --------------------------------------------------------------------------- |
| id        | string            | true     | none         | Knowledge base entry UUID                                                   |
| title     | string            | true     | none         | Entry title shown in the CRM and used as RAG context heading                |
| content   | string            | true     | none         | Full text content (used for vector embedding)                               |
| type      | string            | true     | none         | TEXT = RAG context, LINK = external resource, TEMPLATE = bot reply template |
| fileType  | string            | true     | none         | How the content was ingested                                                |
| url       | object¦null       | false    | none         | External URL for LINK or TEMPLATE entries                                   |
| status    | string            | true     | none         | Processing status — only READY entries are used by the RAG pipeline         |
| isActive  | boolean           | true     | none         | Inactive entries are excluded from vector search                            |
| createdAt | string(date-time) | true     | none         | none                                                                        |
| updatedAt | string(date-time) | true     | none         | none                                                                        |

#### Enumerated Values

| Property | Value         |
| -------- | ------------- |
| type     | TEXT          |
| type     | LINK          |
| type     | TEMPLATE      |
| fileType | TEXT_MANUAL   |
| fileType | PDF           |
| fileType | DOCX          |
| fileType | IMAGE         |
| fileType | VIDEO_LINK    |
| fileType | EXTERNAL_LINK |
| status   | PENDING       |
| status   | PROCESSING    |
| status   | READY         |
| status   | FAILED        |

<h2 id="tocS_CreateKbDto">CreateKbDto</h2>
<!-- backwards compatibility -->
<a id="schemacreatekbdto"></a>
<a id="schema_CreateKbDto"></a>
<a id="tocScreatekbdto"></a>
<a id="tocscreatekbdto"></a>

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "example": "Tutorial Register",
      "minLength": 3
    },
    "content": {
      "type": "string",
      "example": "To register a new trading account, visit...",
      "minLength": 10
    },
    "type": {
      "type": "string",
      "enum": ["TEXT", "LINK", "TEMPLATE"],
      "default": "TEXT",
      "description": "Entry type: TEXT (RAG context), LINK (external resource), TEMPLATE (bot button reply)"
    },
    "url": {
      "type": "string",
      "example": "https://drive.google.com/file/d/...",
      "description": "External URL for LINK/TEMPLATE entries (GDrive, YouTube, S3, etc.)"
    }
  },
  "required": ["title", "content"]
}
```

### Properties

| Name    | Type   | Required | Restrictions | Description                                                                           |
| ------- | ------ | -------- | ------------ | ------------------------------------------------------------------------------------- |
| title   | string | true     | none         | none                                                                                  |
| content | string | true     | none         | none                                                                                  |
| type    | string | false    | none         | Entry type: TEXT (RAG context), LINK (external resource), TEMPLATE (bot button reply) |
| url     | string | false    | none         | External URL for LINK/TEMPLATE entries (GDrive, YouTube, S3, etc.)                    |

#### Enumerated Values

| Property | Value    |
| -------- | -------- |
| type     | TEXT     |
| type     | LINK     |
| type     | TEMPLATE |

<h2 id="tocS_UpdateKbDto">UpdateKbDto</h2>
<!-- backwards compatibility -->
<a id="schemaupdatekbdto"></a>
<a id="schema_UpdateKbDto"></a>
<a id="tocSupdatekbdto"></a>
<a id="tocsupdatekbdto"></a>

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "example": "Updated Title",
      "minLength": 3
    },
    "content": {
      "type": "string",
      "example": "Updated content here...",
      "minLength": 10
    },
    "type": {
      "type": "string",
      "enum": ["TEXT", "LINK", "TEMPLATE"],
      "description": "Entry type"
    },
    "url": {
      "type": "string",
      "example": "https://drive.google.com/...",
      "description": "External URL for LINK/TEMPLATE entries"
    },
    "isActive": {
      "type": "boolean",
      "example": true,
      "description": "Activate or deactivate this entry"
    }
  }
}
```

### Properties

| Name     | Type    | Required | Restrictions | Description                            |
| -------- | ------- | -------- | ------------ | -------------------------------------- |
| title    | string  | false    | none         | none                                   |
| content  | string  | false    | none         | none                                   |
| type     | string  | false    | none         | Entry type                             |
| url      | string  | false    | none         | External URL for LINK/TEMPLATE entries |
| isActive | boolean | false    | none         | Activate or deactivate this entry      |

#### Enumerated Values

| Property | Value    |
| -------- | -------- |
| type     | TEXT     |
| type     | LINK     |
| type     | TEMPLATE |

<h2 id="tocS_CommandMenuResponseDto">CommandMenuResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemacommandmenuresponsedto"></a>
<a id="schema_CommandMenuResponseDto"></a>
<a id="tocScommandmenuresponsedto"></a>
<a id="tocscommandmenuresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "example": "clxyz123abc456",
      "description": "Command menu record UUID"
    },
    "command": {
      "type": "string",
      "example": "tutorial-register",
      "description": "URL-safe slug, also used as Telegram /command"
    },
    "label": {
      "type": "string",
      "example": "📖 Tutorial Register",
      "description": "Button label shown in Telegram inline keyboard"
    },
    "description": {
      "type": "object",
      "example": "Step-by-step guide to register your HFM account",
      "nullable": true,
      "description": "Short description shown in Telegram command list"
    },
    "content": {
      "type": "object",
      "description": "Tiptap JSON document — rendered as Telegram message blocks",
      "example": {
        "type": "doc",
        "content": [
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "Follow these steps..."
              }
            ]
          }
        ]
      }
    },
    "isActive": {
      "type": "boolean",
      "example": true,
      "description": "Inactive menus are hidden from the Telegram /menu keyboard"
    },
    "showInMenu": {
      "type": "boolean",
      "example": true,
      "description": "Whether this entry appears in the /start inline menu"
    },
    "showInKeyboard": {
      "type": "boolean",
      "example": false,
      "description": "Whether this entry appears in the persistent bottom reply keyboard (max 4)"
    },
    "order": {
      "type": "number",
      "example": 0,
      "description": "Display order in the Telegram menu (ascending)"
    },
    "createdAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-20T10:00:00.000Z"
    },
    "updatedAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-24T08:00:00.000Z"
    }
  },
  "required": [
    "id",
    "command",
    "label",
    "content",
    "isActive",
    "showInMenu",
    "showInKeyboard",
    "order",
    "createdAt",
    "updatedAt"
  ]
}
```

### Properties

| Name           | Type              | Required | Restrictions | Description                                                                |
| -------------- | ----------------- | -------- | ------------ | -------------------------------------------------------------------------- |
| id             | string            | true     | none         | Command menu record UUID                                                   |
| command        | string            | true     | none         | URL-safe slug, also used as Telegram /command                              |
| label          | string            | true     | none         | Button label shown in Telegram inline keyboard                             |
| description    | object¦null       | false    | none         | Short description shown in Telegram command list                           |
| content        | object            | true     | none         | Tiptap JSON document — rendered as Telegram message blocks                 |
| isActive       | boolean           | true     | none         | Inactive menus are hidden from the Telegram /menu keyboard                 |
| showInMenu     | boolean           | true     | none         | Whether this entry appears in the /start inline menu                       |
| showInKeyboard | boolean           | true     | none         | Whether this entry appears in the persistent bottom reply keyboard (max 4) |
| order          | number            | true     | none         | Display order in the Telegram menu (ascending)                             |
| createdAt      | string(date-time) | true     | none         | none                                                                       |
| updatedAt      | string(date-time) | true     | none         | none                                                                       |

<h2 id="tocS_CreateCommandMenuDto">CreateCommandMenuDto</h2>
<!-- backwards compatibility -->
<a id="schemacreatecommandmenudto"></a>
<a id="schema_CreateCommandMenuDto"></a>
<a id="tocScreatecommandmenudto"></a>
<a id="tocscreatecommandmenudto"></a>

```json
{
  "type": "object",
  "properties": {
    "command": {
      "type": "string",
      "example": "tutorial-register",
      "description": "URL-safe slug. Used as Telegram bot command (e.g. /tutorial-register)."
    },
    "label": {
      "type": "string",
      "example": "📖 Tutorial Register",
      "description": "Button display label shown in Telegram inline keyboard."
    },
    "description": {
      "type": "string",
      "example": "Step-by-step guide to register your account",
      "description": "Short description shown in Telegram bot commands list."
    },
    "content": {
      "type": "object",
      "description": "Tiptap JSON document (block-based rich content)",
      "example": {
        "type": "doc",
        "content": [
          {
            "type": "heading",
            "attrs": {
              "level": 2
            },
            "content": [
              {
                "type": "text",
                "text": "How to Register"
              }
            ]
          },
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "Follow these steps..."
              }
            ]
          }
        ]
      }
    },
    "order": {
      "type": "number",
      "example": 0,
      "description": "Display order in the Telegram menu (ascending)."
    },
    "showInMenu": {
      "type": "boolean",
      "example": true,
      "description": "Show this entry in the /start inline menu (default true)."
    },
    "showInKeyboard": {
      "type": "boolean",
      "example": false,
      "description": "Show this entry in the persistent bottom reply keyboard (max 4 entries, default false)."
    }
  },
  "required": ["command", "label", "content"]
}
```

### Properties

| Name           | Type    | Required | Restrictions | Description                                                                             |
| -------------- | ------- | -------- | ------------ | --------------------------------------------------------------------------------------- |
| command        | string  | true     | none         | URL-safe slug. Used as Telegram bot command (e.g. /tutorial-register).                  |
| label          | string  | true     | none         | Button display label shown in Telegram inline keyboard.                                 |
| description    | string  | false    | none         | Short description shown in Telegram bot commands list.                                  |
| content        | object  | true     | none         | Tiptap JSON document (block-based rich content)                                         |
| order          | number  | false    | none         | Display order in the Telegram menu (ascending).                                         |
| showInMenu     | boolean | false    | none         | Show this entry in the /start inline menu (default true).                               |
| showInKeyboard | boolean | false    | none         | Show this entry in the persistent bottom reply keyboard (max 4 entries, default false). |

<h2 id="tocS_CommandMenuOrderItem">CommandMenuOrderItem</h2>
<!-- backwards compatibility -->
<a id="schemacommandmenuorderitem"></a>
<a id="schema_CommandMenuOrderItem"></a>
<a id="tocScommandmenuorderitem"></a>
<a id="tocscommandmenuorderitem"></a>

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "example": "clxyz123"
    },
    "order": {
      "type": "number",
      "example": 0
    }
  },
  "required": ["id", "order"]
}
```

### Properties

| Name  | Type   | Required | Restrictions | Description |
| ----- | ------ | -------- | ------------ | ----------- |
| id    | string | true     | none         | none        |
| order | number | true     | none         | none        |

<h2 id="tocS_ReorderCommandMenuDto">ReorderCommandMenuDto</h2>
<!-- backwards compatibility -->
<a id="schemareordercommandmenudto"></a>
<a id="schema_ReorderCommandMenuDto"></a>
<a id="tocSreordercommandmenudto"></a>
<a id="tocsreordercommandmenudto"></a>

```json
{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "clxyz123"
          },
          "order": {
            "type": "number",
            "example": 0
          }
        },
        "required": ["id", "order"]
      }
    }
  },
  "required": ["items"]
}
```

### Properties

| Name  | Type                                                  | Required | Restrictions | Description |
| ----- | ----------------------------------------------------- | -------- | ------------ | ----------- |
| items | [[CommandMenuOrderItem](#schemacommandmenuorderitem)] | true     | none         | none        |

<h2 id="tocS_UpdateCommandMenuDto">UpdateCommandMenuDto</h2>
<!-- backwards compatibility -->
<a id="schemaupdatecommandmenudto"></a>
<a id="schema_UpdateCommandMenuDto"></a>
<a id="tocSupdatecommandmenudto"></a>
<a id="tocsupdatecommandmenudto"></a>

```json
{
  "type": "object",
  "properties": {
    "label": {
      "type": "string",
      "example": "📖 Tutorial Register"
    },
    "description": {
      "type": "string",
      "example": "Step-by-step guide to register your account"
    },
    "content": {
      "type": "object",
      "description": "Tiptap JSON document. Re-generates embedding on save."
    },
    "order": {
      "type": "number",
      "example": 1
    },
    "isActive": {
      "type": "boolean",
      "example": true,
      "description": "Show in /start inline menu"
    },
    "showInMenu": {
      "type": "boolean",
      "example": true,
      "description": "Show in /start inline menu (owner-controlled)"
    },
    "showInKeyboard": {
      "type": "boolean",
      "example": false,
      "description": "Show in persistent bottom reply keyboard (max 4)"
    }
  }
}
```

### Properties

| Name           | Type    | Required | Restrictions | Description                                           |
| -------------- | ------- | -------- | ------------ | ----------------------------------------------------- |
| label          | string  | false    | none         | none                                                  |
| description    | string  | false    | none         | none                                                  |
| content        | object  | false    | none         | Tiptap JSON document. Re-generates embedding on save. |
| order          | number  | false    | none         | none                                                  |
| isActive       | boolean | false    | none         | Show in /start inline menu                            |
| showInMenu     | boolean | false    | none         | Show in /start inline menu (owner-controlled)         |
| showInKeyboard | boolean | false    | none         | Show in persistent bottom reply keyboard (max 4)      |

<h2 id="tocS_AttachmentResponseDto">AttachmentResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemaattachmentresponsedto"></a>
<a id="schema_AttachmentResponseDto"></a>
<a id="tocSattachmentresponsedto"></a>
<a id="tocsattachmentresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "leadId": {
      "type": "string"
    },
    "telegramFileId": {
      "type": "object",
      "nullable": true
    },
    "fileKey": {
      "type": "string"
    },
    "fileUrl": {
      "type": "string"
    },
    "mimeType": {
      "type": "object",
      "nullable": true
    },
    "size": {
      "type": "object",
      "nullable": true
    },
    "uploadedAt": {
      "format": "date-time",
      "type": "string"
    }
  },
  "required": [
    "id",
    "leadId",
    "telegramFileId",
    "fileKey",
    "fileUrl",
    "mimeType",
    "size",
    "uploadedAt"
  ]
}
```

### Properties

| Name           | Type              | Required | Restrictions | Description |
| -------------- | ----------------- | -------- | ------------ | ----------- |
| id             | string            | true     | none         | none        |
| leadId         | string            | true     | none         | none        |
| telegramFileId | object¦null       | true     | none         | none        |
| fileKey        | string            | true     | none         | none        |
| fileUrl        | string            | true     | none         | none        |
| mimeType       | object¦null       | true     | none         | none        |
| size           | object¦null       | true     | none         | none        |
| uploadedAt     | string(date-time) | true     | none         | none        |

<h2 id="tocS_DailyStatsResponseDto">DailyStatsResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemadailystatsresponsedto"></a>
<a id="schema_DailyStatsResponseDto"></a>
<a id="tocSdailystatsresponsedto"></a>
<a id="tocsdailystatsresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "description": "DailyStats record UUID"
    },
    "date": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-24T00:00:00.000Z",
      "description": "The UTC date this snapshot covers (midnight)"
    },
    "newLeads": {
      "type": "number",
      "example": 5,
      "description": "New leads that first messaged the bot on this date"
    },
    "registeredLeads": {
      "type": "number",
      "example": 3,
      "description": "Leads that moved to REGISTERED status on this date"
    },
    "depositReported": {
      "type": "number",
      "example": 2,
      "description": "Leads that reported a deposit on this date"
    },
    "conversions": {
      "type": "number",
      "example": 1,
      "description": "Deposits confirmed by an Owner/Admin on this date"
    },
    "tokensUsed": {
      "type": "number",
      "example": 4820,
      "description": "Total OpenAI tokens consumed on this date"
    },
    "totalLeads": {
      "type": "number",
      "example": 432,
      "description": "Running total of all leads at end of this date"
    },
    "createdAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-24T01:00:00.000Z",
      "description": "Record creation timestamp (usually 1 AM cron)"
    },
    "updatedAt": {
      "format": "date-time",
      "type": "string",
      "example": "2026-02-24T01:00:00.000Z"
    }
  },
  "required": [
    "id",
    "date",
    "newLeads",
    "registeredLeads",
    "depositReported",
    "conversions",
    "tokensUsed",
    "totalLeads",
    "createdAt",
    "updatedAt"
  ]
}
```

### Properties

| Name            | Type              | Required | Restrictions | Description                                        |
| --------------- | ----------------- | -------- | ------------ | -------------------------------------------------- |
| id              | string            | true     | none         | DailyStats record UUID                             |
| date            | string(date-time) | true     | none         | The UTC date this snapshot covers (midnight)       |
| newLeads        | number            | true     | none         | New leads that first messaged the bot on this date |
| registeredLeads | number            | true     | none         | Leads that moved to REGISTERED status on this date |
| depositReported | number            | true     | none         | Leads that reported a deposit on this date         |
| conversions     | number            | true     | none         | Deposits confirmed by an Owner/Admin on this date  |
| tokensUsed      | number            | true     | none         | Total OpenAI tokens consumed on this date          |
| totalLeads      | number            | true     | none         | Running total of all leads at end of this date     |
| createdAt       | string(date-time) | true     | none         | Record creation timestamp (usually 1 AM cron)      |
| updatedAt       | string(date-time) | true     | none         | none                                               |

<h2 id="tocS_AnalyticsDashboardResponseDto">AnalyticsDashboardResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemaanalyticsdashboardresponsedto"></a>
<a id="schema_AnalyticsDashboardResponseDto"></a>
<a id="tocSanalyticsdashboardresponsedto"></a>
<a id="tocsanalyticsdashboardresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "totalLeads": {
      "type": "number",
      "example": 432,
      "description": "Total number of leads in the CRM"
    },
    "newLeads": {
      "type": "number",
      "example": 12,
      "description": "Leads in NEW status"
    },
    "registeredLeads": {
      "type": "number",
      "example": 85,
      "description": "Leads who have submitted registration proof"
    },
    "depositReported": {
      "type": "number",
      "example": 34,
      "description": "Leads who reported a deposit (DEPOSIT_REPORTED status)"
    },
    "depositConfirmed": {
      "type": "number",
      "example": 21,
      "description": "Leads whose deposit was confirmed by an Owner/Admin (DEPOSIT_CONFIRMED status)"
    },
    "recentStats": {
      "description": "Last 7 days of daily snapshot stats",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "description": "DailyStats record UUID"
          },
          "date": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-24T00:00:00.000Z",
            "description": "The UTC date this snapshot covers (midnight)"
          },
          "newLeads": {
            "type": "number",
            "example": 5,
            "description": "New leads that first messaged the bot on this date"
          },
          "registeredLeads": {
            "type": "number",
            "example": 3,
            "description": "Leads that moved to REGISTERED status on this date"
          },
          "depositReported": {
            "type": "number",
            "example": 2,
            "description": "Leads that reported a deposit on this date"
          },
          "conversions": {
            "type": "number",
            "example": 1,
            "description": "Deposits confirmed by an Owner/Admin on this date"
          },
          "tokensUsed": {
            "type": "number",
            "example": 4820,
            "description": "Total OpenAI tokens consumed on this date"
          },
          "totalLeads": {
            "type": "number",
            "example": 432,
            "description": "Running total of all leads at end of this date"
          },
          "createdAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-24T01:00:00.000Z",
            "description": "Record creation timestamp (usually 1 AM cron)"
          },
          "updatedAt": {
            "format": "date-time",
            "type": "string",
            "example": "2026-02-24T01:00:00.000Z"
          }
        },
        "required": [
          "id",
          "date",
          "newLeads",
          "registeredLeads",
          "depositReported",
          "conversions",
          "tokensUsed",
          "totalLeads",
          "createdAt",
          "updatedAt"
        ]
      }
    }
  },
  "required": [
    "totalLeads",
    "newLeads",
    "registeredLeads",
    "depositReported",
    "depositConfirmed",
    "recentStats"
  ]
}
```

### Properties

| Name             | Type                                                    | Required | Restrictions | Description                                                                    |
| ---------------- | ------------------------------------------------------- | -------- | ------------ | ------------------------------------------------------------------------------ |
| totalLeads       | number                                                  | true     | none         | Total number of leads in the CRM                                               |
| newLeads         | number                                                  | true     | none         | Leads in NEW status                                                            |
| registeredLeads  | number                                                  | true     | none         | Leads who have submitted registration proof                                    |
| depositReported  | number                                                  | true     | none         | Leads who reported a deposit (DEPOSIT_REPORTED status)                         |
| depositConfirmed | number                                                  | true     | none         | Leads whose deposit was confirmed by an Owner/Admin (DEPOSIT_CONFIRMED status) |
| recentStats      | [[DailyStatsResponseDto](#schemadailystatsresponsedto)] | true     | none         | Last 7 days of daily snapshot stats                                            |

<h2 id="tocS_WeeklyStatsResponseDto">WeeklyStatsResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemaweeklystatsresponsedto"></a>
<a id="schema_WeeklyStatsResponseDto"></a>
<a id="tocSweeklystatsresponsedto"></a>
<a id="tocsweeklystatsresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "weekStart": {
      "type": "string",
      "example": "2026-02-17",
      "description": "Monday of the ISO week (YYYY-MM-DD)"
    },
    "newLeads": {
      "type": "number",
      "example": 18,
      "description": "New leads that joined during this week"
    },
    "registeredLeads": {
      "type": "number",
      "example": 9,
      "description": "Leads that moved to REGISTERED during this week"
    },
    "depositReported": {
      "type": "number",
      "example": 5,
      "description": "Deposits reported during this week"
    },
    "depositConfirmed": {
      "type": "number",
      "example": 3,
      "description": "Deposits confirmed during this week"
    }
  },
  "required": [
    "weekStart",
    "newLeads",
    "registeredLeads",
    "depositReported",
    "depositConfirmed"
  ]
}
```

### Properties

| Name             | Type   | Required | Restrictions | Description                                     |
| ---------------- | ------ | -------- | ------------ | ----------------------------------------------- |
| weekStart        | string | true     | none         | Monday of the ISO week (YYYY-MM-DD)             |
| newLeads         | number | true     | none         | New leads that joined during this week          |
| registeredLeads  | number | true     | none         | Leads that moved to REGISTERED during this week |
| depositReported  | number | true     | none         | Deposits reported during this week              |
| depositConfirmed | number | true     | none         | Deposits confirmed during this week             |

<h2 id="tocS_MonthlyStatsResponseDto">MonthlyStatsResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemamonthlystatsresponsedto"></a>
<a id="schema_MonthlyStatsResponseDto"></a>
<a id="tocSmonthlystatsresponsedto"></a>
<a id="tocsmonthlystatsresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "monthStart": {
      "type": "string",
      "example": "2026-02-01",
      "description": "First day of the calendar month (YYYY-MM-DD)"
    },
    "newLeads": {
      "type": "number",
      "example": 74,
      "description": "New leads that joined during this month"
    },
    "registeredLeads": {
      "type": "number",
      "example": 38,
      "description": "Leads that moved to REGISTERED during this month"
    },
    "depositReported": {
      "type": "number",
      "example": 20,
      "description": "Deposits reported during this month"
    },
    "depositConfirmed": {
      "type": "number",
      "example": 14,
      "description": "Deposits confirmed during this month"
    }
  },
  "required": [
    "monthStart",
    "newLeads",
    "registeredLeads",
    "depositReported",
    "depositConfirmed"
  ]
}
```

### Properties

| Name             | Type   | Required | Restrictions | Description                                      |
| ---------------- | ------ | -------- | ------------ | ------------------------------------------------ |
| monthStart       | string | true     | none         | First day of the calendar month (YYYY-MM-DD)     |
| newLeads         | number | true     | none         | New leads that joined during this month          |
| registeredLeads  | number | true     | none         | Leads that moved to REGISTERED during this month |
| depositReported  | number | true     | none         | Deposits reported during this month              |
| depositConfirmed | number | true     | none         | Deposits confirmed during this month             |

<h2 id="tocS_KpiStatDto">KpiStatDto</h2>
<!-- backwards compatibility -->
<a id="schemakpistatdto"></a>
<a id="schema_KpiStatDto"></a>
<a id="tocSkpistatdto"></a>
<a id="tocskpistatdto"></a>

```json
{
  "type": "object",
  "properties": {
    "current": {
      "type": "number",
      "example": 74,
      "description": "Value for the current period"
    },
    "previous": {
      "type": "number",
      "example": 58,
      "description": "Value for the previous comparable period"
    },
    "changePercentage": {
      "type": "number",
      "example": 27.6,
      "description": "Percentage change from previous to current period. Positive = growth."
    },
    "trend": {
      "type": "string",
      "enum": ["up", "down", "neutral"],
      "example": "up",
      "description": "Direction of change"
    }
  },
  "required": ["current", "previous", "changePercentage", "trend"]
}
```

### Properties

| Name             | Type   | Required | Restrictions | Description                                                           |
| ---------------- | ------ | -------- | ------------ | --------------------------------------------------------------------- |
| current          | number | true     | none         | Value for the current period                                          |
| previous         | number | true     | none         | Value for the previous comparable period                              |
| changePercentage | number | true     | none         | Percentage change from previous to current period. Positive = growth. |
| trend            | string | true     | none         | Direction of change                                                   |

#### Enumerated Values

| Property | Value   |
| -------- | ------- |
| trend    | up      |
| trend    | down    |
| trend    | neutral |

<h2 id="tocS_AnalyticsKpiDto">AnalyticsKpiDto</h2>
<!-- backwards compatibility -->
<a id="schemaanalyticskpidto"></a>
<a id="schema_AnalyticsKpiDto"></a>
<a id="tocSanalyticskpidto"></a>
<a id="tocsanalyticskpidto"></a>

```json
{
  "type": "object",
  "properties": {
    "totalLeads": {
      "type": "object",
      "properties": {
        "current": {
          "type": "number",
          "example": 74,
          "description": "Value for the current period"
        },
        "previous": {
          "type": "number",
          "example": 58,
          "description": "Value for the previous comparable period"
        },
        "changePercentage": {
          "type": "number",
          "example": 27.6,
          "description": "Percentage change from previous to current period. Positive = growth."
        },
        "trend": {
          "type": "string",
          "enum": ["up", "down", "neutral"],
          "example": "up",
          "description": "Direction of change"
        }
      },
      "required": ["current", "previous", "changePercentage", "trend"]
    },
    "registeredAccounts": {
      "type": "object",
      "properties": {
        "current": {
          "type": "number",
          "example": 74,
          "description": "Value for the current period"
        },
        "previous": {
          "type": "number",
          "example": 58,
          "description": "Value for the previous comparable period"
        },
        "changePercentage": {
          "type": "number",
          "example": 27.6,
          "description": "Percentage change from previous to current period. Positive = growth."
        },
        "trend": {
          "type": "string",
          "enum": ["up", "down", "neutral"],
          "example": "up",
          "description": "Direction of change"
        }
      },
      "required": ["current", "previous", "changePercentage", "trend"]
    },
    "depositingClients": {
      "type": "object",
      "properties": {
        "current": {
          "type": "number",
          "example": 74,
          "description": "Value for the current period"
        },
        "previous": {
          "type": "number",
          "example": 58,
          "description": "Value for the previous comparable period"
        },
        "changePercentage": {
          "type": "number",
          "example": 27.6,
          "description": "Percentage change from previous to current period. Positive = growth."
        },
        "trend": {
          "type": "string",
          "enum": ["up", "down", "neutral"],
          "example": "up",
          "description": "Direction of change"
        }
      },
      "required": ["current", "previous", "changePercentage", "trend"]
    },
    "pendingVerifications": {
      "type": "object",
      "properties": {
        "current": {
          "type": "number",
          "example": 74,
          "description": "Value for the current period"
        },
        "previous": {
          "type": "number",
          "example": 58,
          "description": "Value for the previous comparable period"
        },
        "changePercentage": {
          "type": "number",
          "example": 27.6,
          "description": "Percentage change from previous to current period. Positive = growth."
        },
        "trend": {
          "type": "string",
          "enum": ["up", "down", "neutral"],
          "example": "up",
          "description": "Direction of change"
        }
      },
      "required": ["current", "previous", "changePercentage", "trend"]
    }
  },
  "required": [
    "totalLeads",
    "registeredAccounts",
    "depositingClients",
    "pendingVerifications"
  ]
}
```

### Properties

| Name                 | Type                            | Required | Restrictions | Description |
| -------------------- | ------------------------------- | -------- | ------------ | ----------- |
| totalLeads           | [KpiStatDto](#schemakpistatdto) | true     | none         | none        |
| registeredAccounts   | [KpiStatDto](#schemakpistatdto) | true     | none         | none        |
| depositingClients    | [KpiStatDto](#schemakpistatdto) | true     | none         | none        |
| pendingVerifications | [KpiStatDto](#schemakpistatdto) | true     | none         | none        |

<h2 id="tocS_FunnelConversionRatesDto">FunnelConversionRatesDto</h2>
<!-- backwards compatibility -->
<a id="schemafunnelconversionratesdto"></a>
<a id="schema_FunnelConversionRatesDto"></a>
<a id="tocSfunnelconversionratesdto"></a>
<a id="tocsfunnelconversionratesdto"></a>

```json
{
  "type": "object",
  "properties": {
    "newToRegistered": {
      "type": "number",
      "example": 51.4,
      "description": "Percentage of NEW leads that became REGISTERED"
    },
    "registeredToReported": {
      "type": "number",
      "example": 52.6,
      "description": "Percentage of REGISTERED leads that reported a deposit"
    },
    "reportedToConfirmed": {
      "type": "number",
      "example": 70,
      "description": "Percentage of DEPOSIT_REPORTED leads that were confirmed"
    },
    "overall": {
      "type": "number",
      "example": 18.9,
      "description": "End-to-end conversion: NEW → DEPOSIT_CONFIRMED"
    }
  },
  "required": [
    "newToRegistered",
    "registeredToReported",
    "reportedToConfirmed",
    "overall"
  ]
}
```

### Properties

| Name                 | Type   | Required | Restrictions | Description                                              |
| -------------------- | ------ | -------- | ------------ | -------------------------------------------------------- |
| newToRegistered      | number | true     | none         | Percentage of NEW leads that became REGISTERED           |
| registeredToReported | number | true     | none         | Percentage of REGISTERED leads that reported a deposit   |
| reportedToConfirmed  | number | true     | none         | Percentage of DEPOSIT_REPORTED leads that were confirmed |
| overall              | number | true     | none         | End-to-end conversion: NEW → DEPOSIT_CONFIRMED           |

<h2 id="tocS_AnalyticsFunnelDto">AnalyticsFunnelDto</h2>
<!-- backwards compatibility -->
<a id="schemaanalyticsfunneldto"></a>
<a id="schema_AnalyticsFunnelDto"></a>
<a id="tocSanalyticsfunneldto"></a>
<a id="tocsanalyticsfunneldto"></a>

```json
{
  "type": "object",
  "properties": {
    "new": {
      "type": "number",
      "example": 144,
      "description": "Leads in NEW status during the period"
    },
    "registered": {
      "type": "number",
      "example": 74,
      "description": "Leads in REGISTERED status during the period"
    },
    "depositReported": {
      "type": "number",
      "example": 39,
      "description": "Leads in DEPOSIT_REPORTED status during the period"
    },
    "depositConfirmed": {
      "type": "number",
      "example": 27,
      "description": "Leads in DEPOSIT_CONFIRMED status during the period"
    },
    "conversionRates": {
      "type": "object",
      "properties": {
        "newToRegistered": {
          "type": "number",
          "example": 51.4,
          "description": "Percentage of NEW leads that became REGISTERED"
        },
        "registeredToReported": {
          "type": "number",
          "example": 52.6,
          "description": "Percentage of REGISTERED leads that reported a deposit"
        },
        "reportedToConfirmed": {
          "type": "number",
          "example": 70,
          "description": "Percentage of DEPOSIT_REPORTED leads that were confirmed"
        },
        "overall": {
          "type": "number",
          "example": 18.9,
          "description": "End-to-end conversion: NEW → DEPOSIT_CONFIRMED"
        }
      },
      "required": [
        "newToRegistered",
        "registeredToReported",
        "reportedToConfirmed",
        "overall"
      ]
    }
  },
  "required": [
    "new",
    "registered",
    "depositReported",
    "depositConfirmed",
    "conversionRates"
  ]
}
```

### Properties

| Name             | Type                                                        | Required | Restrictions | Description                                         |
| ---------------- | ----------------------------------------------------------- | -------- | ------------ | --------------------------------------------------- |
| new              | number                                                      | true     | none         | Leads in NEW status during the period               |
| registered       | number                                                      | true     | none         | Leads in REGISTERED status during the period        |
| depositReported  | number                                                      | true     | none         | Leads in DEPOSIT_REPORTED status during the period  |
| depositConfirmed | number                                                      | true     | none         | Leads in DEPOSIT_CONFIRMED status during the period |
| conversionRates  | [FunnelConversionRatesDto](#schemafunnelconversionratesdto) | true     | none         | none                                                |

<h2 id="tocS_TrendSeriesDataDto">TrendSeriesDataDto</h2>
<!-- backwards compatibility -->
<a id="schematrendseriesdatadto"></a>
<a id="schema_TrendSeriesDataDto"></a>
<a id="tocStrendseriesdatadto"></a>
<a id="tocstrendseriesdatadto"></a>

```json
{
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "example": "2026-02-24T14:00",
      "description": "Bucket label: ISO datetime (YYYY-MM-DDTHH:mm) for hourly granularity, or date string (YYYY-MM-DD) for day/week/month granularity"
    },
    "newLeads": {
      "type": "number",
      "example": 18,
      "description": "New leads for this data point"
    },
    "registered": {
      "type": "number",
      "example": 9,
      "description": "Registered leads for this data point"
    },
    "confirmed": {
      "type": "number",
      "example": 3,
      "description": "Deposit-confirmed leads for this data point"
    }
  },
  "required": ["date", "newLeads", "registered", "confirmed"]
}
```

### Properties

| Name       | Type   | Required | Restrictions | Description                                                                                                                      |
| ---------- | ------ | -------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| date       | string | true     | none         | Bucket label: ISO datetime (YYYY-MM-DDTHH:mm) for hourly granularity, or date string (YYYY-MM-DD) for day/week/month granularity |
| newLeads   | number | true     | none         | New leads for this data point                                                                                                    |
| registered | number | true     | none         | Registered leads for this data point                                                                                             |
| confirmed  | number | true     | none         | Deposit-confirmed leads for this data point                                                                                      |

<h2 id="tocS_AnalyticsSummaryResponseDto">AnalyticsSummaryResponseDto</h2>
<!-- backwards compatibility -->
<a id="schemaanalyticssummaryresponsedto"></a>
<a id="schema_AnalyticsSummaryResponseDto"></a>
<a id="tocSanalyticssummaryresponsedto"></a>
<a id="tocsanalyticssummaryresponsedto"></a>

```json
{
  "type": "object",
  "properties": {
    "kpi": {
      "type": "object",
      "properties": {
        "totalLeads": {
          "type": "object",
          "properties": {
            "current": {
              "type": "number",
              "example": 74,
              "description": "Value for the current period"
            },
            "previous": {
              "type": "number",
              "example": 58,
              "description": "Value for the previous comparable period"
            },
            "changePercentage": {
              "type": "number",
              "example": 27.6,
              "description": "Percentage change from previous to current period. Positive = growth."
            },
            "trend": {
              "type": "string",
              "enum": ["up", "down", "neutral"],
              "example": "up",
              "description": "Direction of change"
            }
          },
          "required": ["current", "previous", "changePercentage", "trend"]
        },
        "registeredAccounts": {
          "type": "object",
          "properties": {
            "current": {
              "type": "number",
              "example": 74,
              "description": "Value for the current period"
            },
            "previous": {
              "type": "number",
              "example": 58,
              "description": "Value for the previous comparable period"
            },
            "changePercentage": {
              "type": "number",
              "example": 27.6,
              "description": "Percentage change from previous to current period. Positive = growth."
            },
            "trend": {
              "type": "string",
              "enum": ["up", "down", "neutral"],
              "example": "up",
              "description": "Direction of change"
            }
          },
          "required": ["current", "previous", "changePercentage", "trend"]
        },
        "depositingClients": {
          "type": "object",
          "properties": {
            "current": {
              "type": "number",
              "example": 74,
              "description": "Value for the current period"
            },
            "previous": {
              "type": "number",
              "example": 58,
              "description": "Value for the previous comparable period"
            },
            "changePercentage": {
              "type": "number",
              "example": 27.6,
              "description": "Percentage change from previous to current period. Positive = growth."
            },
            "trend": {
              "type": "string",
              "enum": ["up", "down", "neutral"],
              "example": "up",
              "description": "Direction of change"
            }
          },
          "required": ["current", "previous", "changePercentage", "trend"]
        },
        "pendingVerifications": {
          "type": "object",
          "properties": {
            "current": {
              "type": "number",
              "example": 74,
              "description": "Value for the current period"
            },
            "previous": {
              "type": "number",
              "example": 58,
              "description": "Value for the previous comparable period"
            },
            "changePercentage": {
              "type": "number",
              "example": 27.6,
              "description": "Percentage change from previous to current period. Positive = growth."
            },
            "trend": {
              "type": "string",
              "enum": ["up", "down", "neutral"],
              "example": "up",
              "description": "Direction of change"
            }
          },
          "required": ["current", "previous", "changePercentage", "trend"]
        }
      },
      "required": [
        "totalLeads",
        "registeredAccounts",
        "depositingClients",
        "pendingVerifications"
      ]
    },
    "funnel": {
      "type": "object",
      "properties": {
        "new": {
          "type": "number",
          "example": 144,
          "description": "Leads in NEW status during the period"
        },
        "registered": {
          "type": "number",
          "example": 74,
          "description": "Leads in REGISTERED status during the period"
        },
        "depositReported": {
          "type": "number",
          "example": 39,
          "description": "Leads in DEPOSIT_REPORTED status during the period"
        },
        "depositConfirmed": {
          "type": "number",
          "example": 27,
          "description": "Leads in DEPOSIT_CONFIRMED status during the period"
        },
        "conversionRates": {
          "type": "object",
          "properties": {
            "newToRegistered": {
              "type": "number",
              "example": 51.4,
              "description": "Percentage of NEW leads that became REGISTERED"
            },
            "registeredToReported": {
              "type": "number",
              "example": 52.6,
              "description": "Percentage of REGISTERED leads that reported a deposit"
            },
            "reportedToConfirmed": {
              "type": "number",
              "example": 70,
              "description": "Percentage of DEPOSIT_REPORTED leads that were confirmed"
            },
            "overall": {
              "type": "number",
              "example": 18.9,
              "description": "End-to-end conversion: NEW → DEPOSIT_CONFIRMED"
            }
          },
          "required": [
            "newToRegistered",
            "registeredToReported",
            "reportedToConfirmed",
            "overall"
          ]
        }
      },
      "required": [
        "new",
        "registered",
        "depositReported",
        "depositConfirmed",
        "conversionRates"
      ]
    },
    "trendSeries": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string",
            "example": "2026-02-24T14:00",
            "description": "Bucket label: ISO datetime (YYYY-MM-DDTHH:mm) for hourly granularity, or date string (YYYY-MM-DD) for day/week/month granularity"
          },
          "newLeads": {
            "type": "number",
            "example": 18,
            "description": "New leads for this data point"
          },
          "registered": {
            "type": "number",
            "example": 9,
            "description": "Registered leads for this data point"
          },
          "confirmed": {
            "type": "number",
            "example": 3,
            "description": "Deposit-confirmed leads for this data point"
          }
        },
        "required": ["date", "newLeads", "registered", "confirmed"]
      }
    }
  },
  "required": ["kpi", "funnel", "trendSeries"]
}
```

### Properties

| Name        | Type                                              | Required | Restrictions | Description |
| ----------- | ------------------------------------------------- | -------- | ------------ | ----------- |
| kpi         | [AnalyticsKpiDto](#schemaanalyticskpidto)         | true     | none         | none        |
| funnel      | [AnalyticsFunnelDto](#schemaanalyticsfunneldto)   | true     | none         | none        |
| trendSeries | [[TrendSeriesDataDto](#schematrendseriesdatadto)] | true     | none         | none        |

<h2 id="tocS_UpsertSystemConfigDto">UpsertSystemConfigDto</h2>
<!-- backwards compatibility -->
<a id="schemaupsertsystemconfigdto"></a>
<a id="schema_UpsertSystemConfigDto"></a>
<a id="tocSupsertsystemconfigdto"></a>
<a id="tocsupsertsystemconfigdto"></a>

```json
{
  "type": "object",
  "properties": {
    "value": {
      "type": "string",
      "description": "Config value (raw string)",
      "example": "0.7"
    }
  },
  "required": ["value"]
}
```

### Properties

| Name  | Type   | Required | Restrictions | Description               |
| ----- | ------ | -------- | ------------ | ------------------------- |
| value | string | true     | none         | Config value (raw string) |

<h2 id="tocS_CreateFeedbackDto">CreateFeedbackDto</h2>
<!-- backwards compatibility -->
<a id="schemacreatefeedbackdto"></a>
<a id="schema_CreateFeedbackDto"></a>
<a id="tocScreatefeedbackdto"></a>
<a id="tocscreatefeedbackdto"></a>

```json
{
  "type": "object",
  "properties": {
    "leadId": {
      "type": "string",
      "description": "Lead UUID this conversation belongs to"
    },
    "userMessage": {
      "type": "string",
      "description": "The user message being rated"
    },
    "botReply": {
      "type": "string",
      "description": "The bot reply being rated"
    },
    "rating": {
      "type": "number",
      "description": "1 = bad, 5 = good",
      "enum": [1, 5]
    },
    "notes": {
      "type": "string",
      "description": "Optional notes about why this is good/bad"
    }
  },
  "required": ["leadId", "userMessage", "botReply", "rating"]
}
```

### Properties

| Name        | Type   | Required | Restrictions | Description                               |
| ----------- | ------ | -------- | ------------ | ----------------------------------------- |
| leadId      | string | true     | none         | Lead UUID this conversation belongs to    |
| userMessage | string | true     | none         | The user message being rated              |
| botReply    | string | true     | none         | The bot reply being rated                 |
| rating      | number | true     | none         | 1 = bad, 5 = good                         |
| notes       | string | false    | none         | Optional notes about why this is good/bad |

#### Enumerated Values

| Property | Value |
| -------- | ----- |
| rating   | 1     |
| rating   | 5     |
