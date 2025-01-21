import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Typography } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  where 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [openToast, setOpenToast] = useState(false);
  const [notification, setNotification] = useState({ message: '', sender: '' });
  const { currentUser } = useAuth();
  const [processedMessages] = useState(() => {
    // Initialize from localStorage or create new Set
    const saved = localStorage.getItem('processedMessages');
    return new Set(saved ? JSON.parse(saved) : []);
  });

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribers = [];
    const componentMountTime = Date.now();

    // Listen to all chats containing the current user's ID
    const chatsQuery = query(
      collection(db, 'chats'),
      where('users', 'array-contains', currentUser.uid)
    );

    const chatUnsubscribe = onSnapshot(chatsQuery, (chatSnapshot) => {
      chatSnapshot.docs.forEach((chatDoc) => {
        const chatId = chatDoc.id;
        
        // Set up message listener for each chat
        const messagesQuery = query(
          collection(db, 'chats', chatId, 'messages'),
          orderBy('timestamp', 'desc')
        );

        const messageUnsubscribe = onSnapshot(messagesQuery, (messageSnapshot) => {
          messageSnapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const message = change.doc.data();
              const messageId = change.doc.id;
              const messageTime = message.timestamp?.toMillis();

              // Only show notification if:
              // 1. Message is from another user
              // 2. Message hasn't been processed before
              // 3. Message has a valid timestamp
              // 4. Message was sent after component mount
              if (message.senderId !== currentUser.uid && 
                  !processedMessages.has(messageId) &&
                  messageTime &&
                  messageTime > componentMountTime) {
                
                processedMessages.add(messageId);
                // Save to localStorage to persist across renders
                localStorage.setItem('processedMessages', 
                  JSON.stringify([...processedMessages]));

                setNotification({
                  message: message.text,
                  sender: message.senderName
                });
                setOpenToast(true);
              }
            }
          });
        });

        unsubscribers.push(messageUnsubscribe);
      });
    });

    unsubscribers.push(chatUnsubscribe);

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUser?.uid]);

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenToast(false);
  };

  return (
    <NotificationContext.Provider value={{ setNotification, setOpenToast }}>
      {children}
      <Snackbar
        open={openToast}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ 
          vertical: 'top', 
          horizontal: 'right' 
        }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity="info"
          sx={{
            backgroundColor: '#0a1929', // Dark background
            border: '1px solid rgba(144, 202, 249, 0.2)', // Subtle primary color border
            backdropFilter: 'blur(8px)',
            '& .MuiAlert-icon': {
              color: '#90caf9' // Primary color for icon
            },
            '& .MuiAlert-action': {
              color: '#90caf9' // Primary color for close button
            }
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#90caf9', // Primary color for text
              fontWeight: 500,
              opacity: 0.9 // Slightly dimmed for better dark theme appearance
            }}
          >
            {notification.sender}: {notification.message}
          </Typography>
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}