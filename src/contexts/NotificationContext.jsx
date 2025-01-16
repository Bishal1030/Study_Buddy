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
  const [processedMessages] = useState(new Set());

  useEffect(() => {
    if (!currentUser?.uid) return;

    console.log('Setting up message listener for:', currentUser.uid);
    const unsubscribers = [];

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

              if (message.senderId !== currentUser.uid && 
                  !processedMessages.has(messageId) &&
                  message.timestamp) {
                
                console.log('New message received:', message);
                processedMessages.add(messageId);

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
        sx={{
          position: 'fixed',
          zIndex: 9999,
          mt: 2,
          mr: 2
        }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity="info" 
          sx={{ 
            width: '100%',
            minWidth: '300px',
            boxShadow: 3,
            bgcolor: 'primary.main',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-message': {
              color: 'white'
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            New message from {notification.sender}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              wordBreak: 'break-word',
              maxHeight: '60px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {notification.message}
          </Typography>
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}