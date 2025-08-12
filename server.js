const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '.')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Database setup
const db = new sqlite3.Database('./posts.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initDatabase();
    }
});

// Initialize database tables
function initDatabase() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            authorId TEXT NOT NULL,
            category TEXT NOT NULL,
            tags TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Posts table ready.');
            // Insert sample data if table is empty
            checkAndInsertSampleData();
        }
    });
}

// Check if table is empty and insert sample data
function checkAndInsertSampleData() {
    db.get("SELECT COUNT(*) as count FROM posts", (err, row) => {
        if (err) {
            console.error('Error checking table:', err.message);
        } else if (row.count === 0) {
            insertSampleData();
        }
    });
}

// Insert sample data
function insertSampleData() {
    const samplePosts = [
        {
            title: "Getting Started with Web Development",
            content: "Web development is an exciting journey that combines creativity with technical skills. In this post, we'll explore the fundamentals of HTML, CSS, and JavaScript that every aspiring web developer should know. From creating your first webpage to understanding responsive design principles, this guide will set you on the path to becoming a proficient web developer.",
            authorId: "john_doe",
            category: "Digital and Tech",
            tags: "web development,programming,tutorial"
        },
        {
            title: "The Future of Artificial Intelligence",
            content: "Artificial Intelligence is rapidly transforming our world, from autonomous vehicles to smart home assistants. This technology is not just about robots; it's about creating systems that can learn, adapt, and make decisions. As we move forward, AI will continue to shape industries, create new opportunities, and challenge our understanding of what's possible.",
            authorId: "jane_smith",
            category: "Digital and Tech",
            tags: "AI,technology,future"
        }
    ];

    const insertQuery = `
        INSERT INTO posts (title, content, authorId, category, tags, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    samplePosts.forEach(post => {
        db.run(insertQuery, [post.title, post.content, post.authorId, post.category, post.tags], (err) => {
            if (err) {
                console.error('Error inserting sample data:', err.message);
            }
        });
    });
    console.log('Sample data inserted.');
}

// API Routes

// GET all posts
app.get('/api/posts', (req, res) => {
    const { search, category } = req.query;
    let query = 'SELECT * FROM posts';
    let params = [];

    // Add search and filter conditions
    if (search || category) {
        query += ' WHERE';
        if (search) {
            query += ' (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        if (category) {
            if (search) query += ' AND';
            query += ' category = ?';
            params.push(category);
        }
    }

    query += ' ORDER BY createdAt DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET single post by ID
app.get('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        res.json(row);
    });
});

// POST create new post
app.post('/api/posts', (req, res) => {
    const { title, content, authorId, category, tags } = req.body;
    
    if (!title || !content || !authorId || !category) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    const query = `
        INSERT INTO posts (title, content, authorId, category, tags, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    db.run(query, [title, content, authorId, category, tags || ''], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Get the newly created post
        db.get('SELECT * FROM posts WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json(row);
        });
    });
});

// PUT update post
app.put('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, authorId, category, tags } = req.body;
    
    if (!title || !content || !authorId || !category) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    const query = `
        UPDATE posts 
        SET title = ?, content = ?, authorId = ?, category = ?, tags = ?, updatedAt = datetime('now')
        WHERE id = ?
    `;
    
    db.run(query, [title, content, authorId, category, tags || '', id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        
        // Get the updated post
        db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(row);
        });
    });
});

// DELETE post
app.delete('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM posts WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        
        res.json({ message: 'Post deleted successfully' });
    });
});

// GET categories
app.get('/api/categories', (req, res) => {
    db.all('SELECT DISTINCT category FROM posts ORDER BY category', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows.map(row => row.category));
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(3000, () => console.log('Server running on port 3000'));

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
}); 