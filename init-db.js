const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'posts.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
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
            console.log('Posts table created successfully.');
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
        },
        {
            title: "Building Scalable Web Applications",
            content: "Scalability is a crucial aspect of modern web applications. This post covers the fundamental principles of building applications that can handle growth and increased load. We'll discuss database optimization, caching strategies, load balancing, and microservices architecture.",
            authorId: "tech_guru",
            category: "Digital and Tech",
            tags: "scalability,architecture,web development"
        }
    ];

    const insertQuery = `
        INSERT INTO posts (title, content, authorId, category, tags, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    let insertedCount = 0;
    samplePosts.forEach(post => {
        db.run(insertQuery, [post.title, post.content, post.authorId, post.category, post.tags], (err) => {
            if (err) {
                console.error('Error inserting sample data:', err.message);
            } else {
                insertedCount++;
                if (insertedCount === samplePosts.length) {
                    console.log(`Successfully inserted ${insertedCount} sample posts.`);
                    db.close((err) => {
                        if (err) {
                            console.error('Error closing database:', err.message);
                        } else {
                            console.log('Database initialization completed successfully.');
                            process.exit(0);
                        }
                    });
                }
            }
        });
    });
}

// Handle process termination
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