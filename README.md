# MealWhirl-server
<p align="center">
    <a href="https://nodejs.org/" target="blank">
        <img src="https://nodejs.org/static/images/logo.svg" width="120" alt="Node.js Logo" style="margin-right: 40px;" />
    </a>
    <a href="https://www.docker.com/" target="blank">
        <img src="https://en.vetores.org/d/docker.svg" width="120" alt="Docker Logo" style="margin-right: 40px;" />
    </a>
    <a href="https://kubernetes.io/" target="blank">
        <img src="https://vetores.org/d/kubernetes.svg" width="120" alt="Kubernetes Logo" style="margin-right: 40px;" />
    </a>
    <a href="https://kafka.apache.org/" target="blank">
        <img src="https://www.bettercloud.com/mx-careers/apache_kafka_wordtype-svg" width="120" alt="Kafka Logo" />
    </a>
</p>

<p align="center">
    A microservices-based backend for a food delivery platform, built with Node.js and Express.js.
</p>

<p align="center">
    <a href="https://www.npmjs.com/" target="_blank"><img src="https://img.shields.io/npm/v/express.svg" alt="NPM Version" /></a>
    <a href="https://circleci.com/gh/MealWhirl/MealWhirl-server" target="_blank"><img src="https://img.shields.io/circleci/build/github/MealWhirl/MealWhirl-server/master" alt="Build Status" /></a>
</p>

## Description

MealWhirl-server is a backend application designed to power a food delivery platform. It leverages a microservices architecture to ensure scalability, performance, and maintainability. The platform supports customer, restaurant, and delivery personnel roles, providing features such as real-time order tracking, secure payments, and notifications.

## Features

- **Web/Mobile Interface**: User-friendly interface for browsing restaurants, managing carts, and placing orders.
- **Restaurant Management**: Menu management, order availability, and incoming order handling.
- **Order Management**: Order placement, modification, and real-time tracking.
- **Cart Management**: Add, update, and remove items from the cart.
- **Delivery Management**: Automated driver assignment and real-time delivery tracking using Mapbox.
- **Payment Integration**: Secure payment gateways (PayPal, PayHere, Dialog Genie, FriMi).
- **Notifications**: SMS and email notifications using Nodemailer and Notify.js.
- **Authentication**: Role-based access control with JWT.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Intercommunication**: Apache Kafka
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Real-time Communication**: WebSockets
- **Mapping**: Mapbox
- **Payment Gateway**: PayPal (sandbox)

## Prerequisites

- Node.js (v16+ recommended)
- Docker and Kubernetes
- MongoDB

## Installation

```bash
# Clone the repository
git clone https://github.com/MealWhirl/MealWhirl-server.git

# Navigate into the project folder
cd MealWhirl-server

# Install dependencies
npm install
```

## Running the Project

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Docker Commands

```bash
# Build and start services
docker compose up --build

# Stop services
docker compose down
```

## Environment Variables

Create a `.env` file and define the following variables:

```
PORT=5000
MONGO_URI=your_mongo_url
JWT_SECRET=your_secret_key
NODE_ENV=development
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
MAPBOX_API_KEY=your_mapbox_api_key
KAFKA_BROKER=your_kafka_broker
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

# API Endpoints Documentation

This document defines the HTTP interfaces for all services routed through the API Gateway at `http://localhost:5001/api/v1/`. Each endpoint maps to a Kafka action processed by the corresponding microservice.

## 1. User Service (`/users`)

Base URL: `http://localhost:5001`  
Kafka Topics: `user-request` (requests), `user-response` (responses)

### 1.1 Customer Endpoints

| HTTP Method | Endpoint                  | Kafka Action        | Description                    | Response Status |
|-------------|---------------------------|---------------------|--------------------------------|----------------|
| POST        | `/users/v1/customers`     | create User         | Creates a new user account     | 201            |
| GET         | `/users/v1/customers/:id` | Get Customer By Id  | Retrieves a user by their ID   | 200            |
| GET         | `/users/v1/customers`     | Get All Customers   | Get all customers              | 200            |
| PUT         | `/users/v1/customers/:id` | Update Customer     | Update customer type user      | 200            |
| DELETE      | `/users/v1/customers/:id` | Delete customer     | Delete customer from system    | 200            |

### 1.2 Restaurant Endpoints

| HTTP Method | Endpoint                   | Kafka Action         | Description                     | Response Status |
|-------------|----------------------------|----------------------|---------------------------------|----------------|
| POST        | `/users/v1/resturants`     | create User          | Creates a new restaurant account| 201            |
| GET         | `/users/v1/resturants/:id` | Get resturants By Id | Retrieves a restaurant by ID    | 200            |
| GET         | `/users/v1/resturants`     | Get All resturants   | Get all restaurants             | 200            |
| PUT         | `/users/v1/resturants/:id` | Update resturants    | Update restaurant type user     | 200            |
| DELETE      | `/users/v1/resturants/:id` | Delete resturants    | Delete restaurant from system   | 200            |

### 1.3 Admin Endpoints

| HTTP Method | Endpoint               | Kafka Action      | Description                  | Response Status |
|-------------|------------------------|-------------------|------------------------------|----------------|
| POST        | `/users/v1/admins`     | create User       | Creates a new admin account  | 201            |
| GET         | `/users/v1/admins/:id` | Get admin By Id   | Retrieves an admin by ID     | 200            |
| GET         | `/users/v1/admins`     | Get All admins    | Get all admins               | 200            |
| PUT         | `/users/v1/admins/:id` | Update admin      | Update admin type user       | 200            |
| DELETE      | `/users/v1/admins/:id` | Delete admin      | Delete admin from system     | 200            |

### 1.4 Driver Endpoints

| HTTP Method | Endpoint               | Kafka Action      | Description                  | Response Status |
|-------------|------------------------|-------------------|------------------------------|----------------|
| POST        | `/users/v1/drivers`     | create User       | Creates a new driver account | 201            |
| GET         | `/users/v1/drivers/:id` | Get driver By Id  | Retrieves a driver by ID     | 200            |
| GET         | `/users/v1/drivers`     | Get All drivers   | Get all drivers              | 200            |
| PUT         | `/users/v1/drivers/:id` | Update driver     | Update driver type user      | 200            |
| DELETE      | `/users/v1/drivers/:id` | Delete driver     | Delete driver from system    | 200            |

## 2. Auth Service (`/auth`)

Base URL: `http://localhost:5001/api/v1/auth`  
Kafka Topics: `auth-request` (requests), `auth-response` (responses), `auth-validation` (token validation)

| HTTP Method | Endpoint    | Kafka Action | Description                        | Response Status |
|-------------|-------------|-------------|------------------------------------|----------------|
| POST        | `/login`    | login       | Authenticates a user with credentials | 200           |
| POST        | `/register` | register    | Creates a new user account          | 201            |

## 3. Cart Service (`/carts`)

Base URL: `http://localhost:5001/api/v1/carts`  
Kafka Topics: `cart-request` (requests), `cart-response` (responses)

| HTTP Method | Endpoint               | Kafka Action        | Description                          | Response Status |
|-------------|------------------------|---------------------|--------------------------------------|----------------|
| POST        | `/`                    | addToCart           | Adds an item to a user's cart        | 201            |
| GET         | `/`                    | getAllCarts         | Retrieves all carts in the system    | 200            |
| GET         | `/:id`                 | getCartById         | Fetches a cart by its ID             | 200            |
| GET         | `/user/:userId`        | getCartByUserId     | Retrieves a cart for a specific user | 200            |
| PATCH       | `/item`                | updateCartItem      | Updates an item in the cart          | 200            |
| DELETE      | `/item`                | removeItemFromCart  | Removes an item from the cart        | 200            |
| DELETE      | `/:id`                 | deleteCart          | Deletes a cart by its ID             | 200            |
| PATCH       | `/active-restaurant`   | setActiveRestaurant | Sets the active restaurant for cart  | 200            |

## 4. Order Service (`/orders`)

Base URL: `http://localhost:5001/api/v1/orders`  
Kafka Topics: `order-request` (requests), `order-response` (responses)

| HTTP Method | Endpoint                          | Kafka Action            | Description                       | Response Status |
|-------------|-----------------------------------|-------------------------|-----------------------------------|----------------|
| POST        | `/`                               | createOrder             | Creates a new order               | 201            |
| GET         | `/`                               | getAllOrders            | Retrieves all orders in the system| 200            |
| GET         | `/:id`                            | getOrderById            | Fetches an order by its ID        | 200            |
| PATCH       | `/:id/status`                     | updateOrderStatus       | Updates the status of an order    | 200            |
| PATCH       | `/:id/delivery`                   | assignDeliveryPerson    | Assigns a delivery person to order| 200            |
| GET         | `/user/:userId`                   | getOrdersByUserId       | Retrieves all orders for a user   | 200            |
| GET         | `/restaurant/:restaurantId`       | getOrdersByRestaurantId | Fetches orders for a restaurant   | 200            |
| GET         | `/delivery/:deliveryPersonId`     | getOrdersByDeliveryPersonId | Gets orders for delivery person| 200            |
| DELETE      | `/:id`                            | deleteOrder             | Deletes an order by its ID        | 200            |

## 5. Payment Service (`/payments`)

Base URL: `http://localhost:5001/api/v1/payments`  
Kafka Topics: `payment-request` (requests), `payment-response` (responses)

| HTTP Method | Endpoint             | Kafka Action           | Description                       | Response Status |
|-------------|----------------------|------------------------|-----------------------------------|----------------|
| POST        | `/`                  | createTransaction      | Initiates a new payment transaction| 201           |
| GET         | `/`                  | getAllTransactions     | Retrieves all transactions        | 200            |
| GET         | `/:id`               | getTransactionById     | Fetches a transaction by its ID   | 200            |
| PATCH       | `/:id/status`        | updateTransactionStatus| Updates transaction status        | 200            |
| GET         | `/user/:userId`      | getTransactionsByUserId| Gets transactions for a user      | 200            |
| DELETE      | `/:id`               | deleteTransaction      | Deletes a transaction by its ID   | 200            |

## 6. Notification Service (`/notifications`)

Base URL: `http://localhost:5001/api/v1/notifications`  
Kafka Topics: `notification-request` (requests), `notification-response` (responses)

| HTTP Method | Endpoint                    | Kafka Action             | Description                      | Response Status |
|-------------|-----------------------------|--------------------------|---------------------------------|----------------|
| POST        | `/`                         | createNotification       | Creates a new notification      | 201            |
| GET         | `/:notificationId`          | getNotificationByID      | Gets a notification by its ID   | 200            |
| GET         | `/user/:userId`             | getAllNotificationByUser | Gets notifications for a user   | 200            |
| DELETE      | `/:notificationId`          | deleteNotification       | Deletes a notification          | 200            |
| PATCH       | `/:notificationId/read`     | updateNotificationIsRead | Updates notification read status| 200            |
| POST        | `/notification/email`       | sendEmailNotification    | Sends an Email notification     | 200            |
| POST        | `/notification/sms`         | sendSMSNotification      | Sends an SMS notification       | 200            |

## 7. Health Check

Base URL: `http://localhost:5001/api/v1/health`  
Description: Checks the health of the API Gateway.

| HTTP Method | Endpoint | Description                                    | Response Status |
|-------------|----------|------------------------------------------------|----------------|
| GET         | `/`      | Returns "API gateway is healthy" message       | 200            |

## Notes

- **Request Flow**: HTTP requests are routed to the appropriate Kafka topic (e.g., `cart-request`) via the API Gateway's `sendMessageWithResponse` function. The microservice processes the request and sends a response to the corresponding response topic (e.g., `cart-response`).
- **Error Handling**: Unknown actions return a 400 status. Server errors return a 500 status. The response body includes an error message.
- **Correlation ID**: Each request includes a `correlationId` to match responses, handled by the API Gateway.
- **Kafka Actions**: The `action` field in the Kafka message payload determines the operation (e.g., `addToCart`, `createOrder`).
- **Validation**: Some services (e.g., Order, Payment, Notification) rely on `user-validation` topic responses to validate users before processing requests.


## Testing

### Unit Tests

```bash
npm test
```

## Contributors

- [Induwara Sirimanna](https://github.com/bhashanasirimanna)
- [Thimesha Ansar](https://github.com/thimeshaA)
- [Arshaq Shazly](https://github.com/muhammedarshaq)
- [Randini Malshika](https://github.com/randinim)



## License

This project is licensed under the MIT License.
