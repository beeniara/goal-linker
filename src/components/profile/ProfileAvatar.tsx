
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '@/firebase/config';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { UserData } from '@/types/auth';
import { Image } from 'lucide-react';

interface ProfileAvatarProps {
  userData: UserData | null;
  refreshUserData: () => Promise<void>;
}

const ProfileAvatar = ({ userData, refreshUserData }: ProfileAvatarProps) => {
  const { toast } = useToast();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const getInitials = () => {
    if (!userData?.displayName) return 'U';
    return userData.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!auth.currentUser || !e.target.files || e.target.files.length === 0) return;
    
    try {
      setUploadingPhoto(true);
      
      const file = e.target.files[0];
      const fileRef = ref(storage, `users/${auth.currentUser.uid}/profile.${file.name.split('.').pop()}`);
      
      // Upload file to Firebase Storage
      await uploadBytes(fileRef, file);
      
      // Get download URL
      const photoURL = await getDownloadURL(fileRef);
      
      // Update user profile in Firebase Auth
      await updateProfile(auth.currentUser, { photoURL });
      
      // Update user document in Firestore
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        photoURL,
        updatedAt: new Date(),
      });
      
      // Refresh user data in context
      await refreshUserData();
      
      toast({
        title: 'Photo updated',
        description: 'Your profile photo has been successfully updated.',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <Avatar className="h-24 w-24">
        <AvatarImage src={userData?.photoURL || ''} alt={userData?.displayName || 'User'} />
        <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
      </Avatar>
      <div className="relative">
        <Button variant="outline" size="sm" className="text-xs" disabled={uploadingPhoto}>
          <label className="cursor-pointer flex items-center">
            <Image className="h-3 w-3 mr-1" />
            {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
            />
          </label>
        </Button>
      </div>
    </div>
  );
};

export default ProfileAvatar;
