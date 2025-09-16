# My_RMS Backend - Laravel API

## Overview
This is the Laravel backend API for the Restaurant Management System (My_RMS). It provides authentication and API endpoints for the React frontend.

## Features
- **Authentication**: User registration, login, logout using Laravel Sanctum
- **Role-based Access**: Support for admin, chef, staff, waiter, customer roles
- **API Token Management**: Secure token-based authentication
- **User Management**: User profiles and role management

## Setup Instructions

### Prerequisites
- PHP 8.1 or higher
- Composer
- SQLite/MySQL/PostgreSQL (configured for SQLite by default)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Run migrations and seed database**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

5. **Start the development server**
   ```bash
   php artisan serve --port=8000
   ```

The API will be available at: `http://localhost:8000/api`

## API Endpoints

### Authentication
- `POST /api/signup` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user (requires authentication)
- `GET /api/me` - Get authenticated user details (requires authentication)

### Request/Response Examples

#### Signup
```json
POST /api/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"
}

Response:
{
  "message": "User registered successfully",
  "user": {...},
  "token": "token_string",
  "token_type": "Bearer"
}
```

#### Login
```json
POST /api/login
{
  "email": "admin@restaurant.com",
  "password": "password"
}

Response:
{
  "message": "Login successful",
  "user": {...},
  "token": "token_string",
  "token_type": "Bearer"
}
```

## Default Users
The system includes seeded demo users:
- Admin: `admin@restaurant.com` / `password`
- Chef: `chef@restaurant.com` / `password`
- Waiter: `waiter@restaurant.com` / `password`
- Staff: `staff@restaurant.com` / `password`
- Customer: `customer@restaurant.com` / `password`

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - User role (admin, chef, staff, waiter, customer)
- `email_verified_at` - Email verification timestamp
- `created_at` / `updated_at` - Timestamps

## Security
- Passwords are hashed using bcrypt
- API authentication via Laravel Sanctum tokens
- CORS configured for frontend integration
- Input validation on all endpoints

## Future Enhancements
- Add more API endpoints for menu, orders, etc.
- Implement email verification
- Add password reset functionality
- Role-based permissions middleware
- API rate limiting

## Configuration
- Database: SQLite (default) - can be changed in `.env`
- API Prefix: `/api`
- Token Expiration: Configurable in `config/sanctum.php`

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
