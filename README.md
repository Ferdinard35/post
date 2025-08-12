# Post Management System

A complete CRUD (Create, Read, Update, Delete) application for managing posts with a classic, user-friendly interface, backend API, and SQLite database.

## Features

- **Create Posts**: Add new posts with title, content, author ID, category, and tags
- **Read Posts**: View all posts with search and filter functionality
- **Update Posts**: Edit existing posts with a simple form interface
- **Delete Posts**: Remove posts with confirmation dialog
- **Search & Filter**: Search posts by title, content, or tags, and filter by category
- **Responsive Design**: Works on desktop and mobile devices
- **Backend API**: RESTful API built with Node.js and Express
- **Database**: SQLite database for data persistence
- **Classic Interface**: Clean, professional design with modern UX

## Post Entity Structure

Each post contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Unique identifier (auto-generated) |
| `title` | String | Title of the post |
| `content` | String | Main body of the post |
| `authorId` | String | User who created the post |
| `category` | String | Post category (e.g., Digital and Tech, Business, Lifestyle) |
| `tags` | String | Optional topics/labels (comma-separated) |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last updated timestamp |

## Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

## Installation & Setup

1. **Clone/Download** the project files
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```
4. **Open your browser** and navigate to `http://localhost:3000`

## Project Structure

```
post/
├── index.html          # Main HTML file
├── post.css           # Stylesheet for the application
├── post.js            # Frontend JavaScript with API integration
├── server.js          # Express server with API endpoints
├── package.json       # Node.js dependencies and scripts
├── posts.db           # SQLite database (created automatically)
└── README.md          # This documentation
```

## API Endpoints

### Posts
- `GET /api/posts` - Get all posts (with optional search and category filters)
- `GET /api/posts/:id` - Get a specific post by ID
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update an existing post
- `DELETE /api/posts/:id` - Delete a post

### Categories
- `GET /api/categories` - Get all unique categories

### Query Parameters
- `search` - Search in title, content, or tags
- `category` - Filter by category

## Database

The application uses **SQLite** as the database, which is:
- **File-based**: No separate database server required
- **Lightweight**: Perfect for small to medium applications
- **Reliable**: ACID compliant
- **Automatic**: Database and tables are created automatically on first run

### Database Schema

```sql
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    authorId TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Usage

### Creating a Post
1. Fill out the form on the left side
2. Enter title, content, author ID, category, and optional tags
3. Click "Add Post" to create the post

### Viewing Posts
- All posts are displayed on the right side
- Use the search box to find specific posts
- Use the category filter to filter by category
- Click "View" to see the full post content in a modal

### Editing a Post
1. Click "Edit" on any post
2. The form will be populated with the post's current data
3. Make your changes
4. Click "Update Post" to save changes
5. Click "Cancel" to discard changes

### Deleting a Post
1. Click "Delete" on any post
2. Confirm the deletion in the dialog
3. The post will be permanently removed from the database

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon to automatically restart the server when files change.

### Database Management
The database is automatically created and managed by the application. If you need to reset the database:
1. Stop the server
2. Delete the `posts.db` file
3. Restart the server (it will recreate the database with sample data)

### Adding New Features
The modular structure makes it easy to add new features:

1. **New API endpoints**: Add routes in `server.js`
2. **Database changes**: Modify the schema in the `initDatabase()` function
3. **Frontend features**: Extend the `PostManager` class in `post.js`

## Technologies Used

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox and grid
- **JavaScript (ES6+)**: Vanilla JavaScript with classes and async/await

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **SQLite3**: Database
- **CORS**: Cross-origin resource sharing
- **Body-parser**: Request body parsing

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Error Handling

The application includes comprehensive error handling:
- **Frontend**: User-friendly error messages and notifications
- **Backend**: Proper HTTP status codes and error responses
- **Database**: Connection error handling and data validation

## Security Considerations

- **Input validation**: All user inputs are validated
- **SQL injection protection**: Parameterized queries
- **CORS**: Configured for development (adjust for production)
- **Error messages**: Sanitized to prevent information leakage

## Production Deployment

For production deployment, consider:
1. **Environment variables**: Use `process.env` for configuration
2. **HTTPS**: Enable SSL/TLS
3. **Database**: Consider using PostgreSQL or MySQL for larger scale
4. **Caching**: Implement Redis for better performance
5. **Logging**: Add proper logging (Winston, Morgan)
6. **PM2**: Use PM2 for process management

## License

This project is open source and available under the MIT License. 