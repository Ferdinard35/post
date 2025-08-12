// Post Management System - JavaScript with Backend Integration

class PostManager {
    constructor() {
        this.posts = [];
        this.currentEditId = null;
        this.apiBaseUrl = this.computeApiBaseUrl();
        this.init();
    }

    computeApiBaseUrl() {
        try {
            const isFileProtocol = window.location.protocol === 'file:';
            const isSameServer = window.location.port === '3000' || window.location.hostname === 'localhost' && window.location.port === '';
            if (isFileProtocol) {
                return 'http://localhost:3000/api';
            }
            if (isSameServer) {
                return '/api';
            }
            return 'http://localhost:3000/api';
        } catch (_) {
            return '/api';
        }
    }

    async init() {
        this.setupEventListeners();
        await this.loadPosts();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('post-form');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Cancel button
        const cancelBtn = document.getElementById('cancel-btn');
        cancelBtn.addEventListener('click', () => this.cancelEdit());

        // Search and filter
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        
        searchInput.addEventListener('input', () => this.filterPosts());
        categoryFilter.addEventListener('change', () => this.filterPosts());
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const postData = {
            title: formData.get('title'),
            content: formData.get('content'),
            authorId: formData.get('authorId'),
            category: formData.get('category'),
            tags: formData.get('tags')
        };

        try {
            if (this.currentEditId) {
                await this.updatePost(postData);
            } else {
                await this.createPost(postData);
            }

            this.resetForm();
            await this.loadPosts();
        } catch (error) {
            this.showNotification('Error: ' + error.message, 'error');
        }
    }

    async createPost(postData) {
        const response = await fetch(`${this.apiBaseUrl}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to create post');
        }

        this.showNotification('Post created successfully!', 'success');
    }

    async updatePost(postData) {
        const response = await fetch(`${this.apiBaseUrl}/posts/${this.currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to update post');
        }

        this.showNotification('Post updated successfully!', 'success');
        this.currentEditId = null;
    }

    async deletePost(id) {
        if (confirm('Are you sure you want to delete this post?')) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/posts/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.error || 'Failed to delete post');
                }

                await this.loadPosts();
                this.showNotification('Post deleted successfully!', 'success');
            } catch (error) {
                this.showNotification('Error: ' + error.message, 'error');
            }
        }
    }

    async editPost(id) {
        const post = this.posts.find(p => p.id == id);
        if (post) {
            this.currentEditId = id;
            this.populateForm(post);
            document.getElementById('form-title').textContent = 'Edit Post';
            document.getElementById('submit-btn').textContent = 'Update Post';
            document.getElementById('cancel-btn').style.display = 'block';
        }
    }

    async viewPost(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/posts/${id}`);
            if (!response.ok) {
                throw new Error('Post not found');
            }
            const post = await response.json();
            this.showPostModal(post);
        } catch (error) {
            this.showNotification('Error: ' + error.message, 'error');
        }
    }

    populateForm(post) {
        document.getElementById('title').value = post.title;
        document.getElementById('content').value = post.content;
        document.getElementById('authorId').value = post.authorId;
        document.getElementById('category').value = post.category;
        document.getElementById('tags').value = post.tags || '';
    }

    resetForm() {
        document.getElementById('post-form').reset();
        this.currentEditId = null;
        document.getElementById('form-title').textContent = 'Add New Post';
        document.getElementById('submit-btn').textContent = 'Add Post';
        document.getElementById('cancel-btn').style.display = 'none';
    }

    cancelEdit() {
        this.resetForm();
    }

    async loadPosts() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/posts`);
            if (!response.ok) {
                throw new Error('Failed to load posts');
            }
            this.posts = await response.json();
            this.renderPosts();
        } catch (error) {
            this.showNotification('Error loading posts: ' + error.message, 'error');
            this.renderPosts([]);
        }
    }

    async filterPosts() {
        const searchTerm = document.getElementById('search-input').value;
        const categoryFilter = document.getElementById('category-filter').value;
        
        let url = `${this.apiBaseUrl}/posts?`;
        const params = new URLSearchParams();
        
        if (searchTerm) {
            params.append('search', searchTerm);
        }
        if (categoryFilter) {
            params.append('category', categoryFilter);
        }
        
        if (params.toString()) {
            url += params.toString();
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to filter posts');
            }
            const filteredPosts = await response.json();
            this.renderPosts(filteredPosts);
        } catch (error) {
            this.showNotification('Error filtering posts: ' + error.message, 'error');
        }
    }

    renderPosts(postsToRender = this.posts) {
        const postsList = document.getElementById('posts-list');
        
        if (postsToRender.length === 0) {
            postsList.innerHTML = `
                <div class="empty-state">
                    <h3>No posts found</h3>
                    <p>${this.posts.length === 0 ? 'Create your first post to get started!' : 'No posts match your search criteria.'}</p>
                </div>
            `;
            return;
        }

        postsList.innerHTML = postsToRender.map(post => this.createPostHTML(post)).join('');
    }

    createPostHTML(post) {
        const tagsHTML = post.tags ? post.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('') : '';
        const createdAt = new Date(post.createdAt).toLocaleDateString();
        const updatedAt = new Date(post.updatedAt).toLocaleDateString();
        
        return `
            <div class="post-item" data-id="${post.id}">
                <div class="post-header">
                    <div>
                        <div class="post-title">${this.escapeHtml(post.title)}</div>
                        <div class="post-meta">
                            <strong>Author:</strong> ${this.escapeHtml(post.authorId)} | 
                            <strong>Category:</strong> ${this.escapeHtml(post.category)} | 
                            <strong>Created:</strong> ${createdAt} | 
                            <strong>Updated:</strong> ${updatedAt}
                        </div>
                    </div>
                </div>
                <div class="post-content">${this.escapeHtml(post.content)}</div>
                ${tagsHTML ? `<div class="post-tags">${tagsHTML}</div>` : ''}
                <div class="post-actions">
                    <button class="view-btn" onclick="postManager.viewPost('${post.id}')">View</button>
                    <button class="edit-btn" onclick="postManager.editPost('${post.id}')">Edit</button>
                    <button class="delete-btn" onclick="postManager.deletePost('${post.id}')">Delete</button>
                </div>
            </div>
        `;
    }

    showPostModal(post) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${this.escapeHtml(post.title)}</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="post-meta">
                        <strong>Author:</strong> ${this.escapeHtml(post.authorId)} | 
                        <strong>Category:</strong> ${this.escapeHtml(post.category)} | 
                        <strong>Created:</strong> ${new Date(post.createdAt).toLocaleDateString()} | 
                        <strong>Updated:</strong> ${new Date(post.updatedAt).toLocaleDateString()}
                    </div>
                    <div class="post-content-full">
                        ${this.escapeHtml(post.content).replace(/\n/g, '<br>')}
                    </div>
                    ${post.tags ? `
                        <div class="post-tags">
                            ${post.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        const closeBtn = modal.querySelector('.close');
        const closeModal = () => {
            document.body.removeChild(modal);
        };

        closeBtn.onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            notification.style.background = '#28a745';
        } else if (type === 'error') {
            notification.style.background = '#dc3545';
        } else {
            notification.style.background = '#17a2b8';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
const postManager = new PostManager();

// Add CSS for modal and notifications
const additionalStyles = `
    .modal {
        display: block;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
    }

    .modal-content {
        background-color: white;
        margin: 5% auto;
        padding: 0;
        border-radius: 8px;
        width: 80%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h2 {
        margin: 0;
        color: #333;
    }

    .close {
        color: #aaa;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
    }

    .close:hover {
        color: #000;
    }

    .modal-body {
        padding: 20px;
    }

    .post-content-full {
        line-height: 1.6;
        margin: 15px 0;
        color: #555;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 