import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Typography } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  serverTimestamp
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

    const unsubscribers = [];
    const componentMountTime = Date.now();

    const chatsQuery = query(
      collection(db, 'chats'),
      where('users', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(chatsQuery, (chatSnapshot) => {
      chatSnapshot.docs.forEach((chatDoc) => {
        const messagesQuery = query(
          collection(db, 'chats', chatDoc.id, 'messages'),
          orderBy('timestamp', 'desc'),
          where('timestamp', '>', new Date(componentMountTime))
        );

        const messageUnsubscribe = onSnapshot(messagesQuery, (messageSnapshot) => {
          messageSnapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const message = change.doc.data();
              const messageId = change.doc.id;
              
              if (message.senderId !== currentUser.uid && 
                  !processedMessages.has(messageId)) {
                processedMessages.add(messageId);
                
                // Truncate long messages for notification
                const MAX_NOTIFICATION_LENGTH = 50;
                const truncatedMessage = message.text.length > MAX_NOTIFICATION_LENGTH 
                  ? `${message.text.substring(0, MAX_NOTIFICATION_LENGTH)}...`
                  : message.text;

                setNotification({
                  message: truncatedMessage,
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

    unsubscribers.push(unsubscribe);

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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity="info"
          sx={{
            backgroundColor: '#0a1929',
            border: '1px solid rgba(144, 202, 249, 0.2)',
            backdropFilter: 'blur(8px)',
            width: '300px',
            height: '48px',
            '& .MuiAlert-icon': {
              color: '#90caf9'
            },
            '& .MuiAlert-action': {
              color: '#90caf9'
            },
            '& .MuiAlert-message': {
              padding: '4px 0',
              width: '100%',
              overflow: 'hidden'
            }
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#90caf9',
              fontWeight: 500,
              opacity: 0.9,
              width: '220px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.5'
            }}
          >
            {notification.sender}: {notification.message}
          </Typography>
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}