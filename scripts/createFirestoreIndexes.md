# 🔥 Firebase Firestore Indexes Setup

## Required Composite Indexes

### 1. Featured Projects Index
**Collection**: `projects`
**Fields**:
- `status` (Ascending)
- `featured` (Ascending) 
- `voteCount` (Descending)
- `__name__` (Ascending)

**Query**: Featured projects sorted by vote count
```javascript
where('status', '==', 'approved')
where('featured', '==', true)
orderBy('voteCount', 'desc')
```

### 2. Category Projects Index
**Collection**: `projects`
**Fields**:
- `status` (Ascending)
- `category` (Ascending)
- `createdAt` (Descending)
- `__name__` (Ascending)

**Query**: Projects by category sorted by creation date
```javascript
where('status', '==', 'approved')
where('category', '==', 'categoryName')
orderBy('createdAt', 'desc')
```

### 3. New Projects Index (Already exists - single field)
**Collection**: `projects`
**Fields**:
- `status` (Ascending)
- `createdAt` (Descending)
- `__name__` (Ascending)

**Query**: New projects sorted by creation date
```javascript
where('status', '==', 'approved')
orderBy('createdAt', 'desc')
```

## How to Create Indexes

### Method 1: Automatic (Recommended)
1. Visit your app and trigger the queries
2. Firebase will show error messages with direct links
3. Click the links to auto-create indexes

### Method 2: Manual Creation
1. Go to Firebase Console: https://console.firebase.google.com/project/showyourproject-com/firestore/indexes
2. Click "Create Index"
3. Enter the collection and fields as specified above
4. Click "Create"

### Method 3: Firebase CLI
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy indexes (requires firestore.indexes.json)
firebase deploy --only firestore:indexes
```

## Index Status Check

After creating indexes, you can check their status:
1. Go to Firebase Console → Firestore → Indexes
2. Wait for all indexes to show "Enabled" status
3. Test your queries

## Expected Index Creation Time
- Simple indexes: 1-2 minutes
- Complex indexes: 5-10 minutes
- Large datasets: 10+ minutes

## Troubleshooting

### If queries still fail:
1. Check index status in Firebase Console
2. Verify field names match exactly
3. Ensure collection name is correct
4. Wait for index to fully build

### Common Issues:
- **Case sensitivity**: Field names are case-sensitive
- **Data types**: Ensure consistent data types across documents
- **Missing fields**: Some documents might be missing indexed fields

## Production Considerations

### Security Rules
After creating indexes, update Firestore rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Projects are readable by all
    match /projects/{projectId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.submitterId || 
         request.auth.token.email == 'admin@showyourproject.com');
    }
    
    // Other collections...
  }
}
```

### Performance Tips
1. **Limit results**: Always use `limit()` in queries
2. **Pagination**: Use `startAfter()` for large datasets
3. **Client-side filtering**: For complex text search
4. **Caching**: Implement proper caching strategies

## Index Maintenance

### Regular Tasks:
- Monitor index usage in Firebase Console
- Remove unused indexes to save costs
- Update indexes when query patterns change
- Test indexes after schema changes

### Cost Optimization:
- Each index has storage and write costs
- Remove indexes for unused queries
- Consider client-side sorting for small datasets
