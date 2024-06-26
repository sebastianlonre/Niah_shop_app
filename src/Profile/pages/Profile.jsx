import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from '../../context/auth/AuthContext';
import { getDoc, doc, getFirestore } from "firebase/firestore";
import { SocialContext } from "../../social/context";
import { ViewSocial } from "../../modals/ViewSocial";
import { useModal } from "../../modals/hooks/useModal";

export const Profile = () => {
  const { user, updateUserProfile, updateUserProfileImageInContext } = useContext(AuthContext);
  const [formState, setFormState] = useState({
    username: user?.displayName || '',
    email: user?.email || '',
    password: '',
    bio: '',
    createdAt: '',
    updatedAt: ''
  });
  const [updateMessage, setUpdateMessage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const db = getFirestore();
        const userRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setFormState(prevState => ({
            ...prevState,
            bio: userData.bio || '',
            createdAt: userData.createdAt || '',
            updatedAt: userData.updatedAt || ''
          }));
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const updatedUserData = {
      displayName: formState.username,
      bio: formState.bio,
      password: formState.password.trim() !== '' ? formState.password : null
    };

    if (selectedImage) {
      const { ok, imageUrl, errorMessage } = await updateUserProfileImageInContext(selectedImage);

      if (!ok) {
        setUpdateMessage(errorMessage || 'Error al actualizar la imagen de perfil');
        return;
      }

      updatedUserData.photoURL = imageUrl;
    }

    const { ok, message, errorMessage } = await updateUserProfile(updatedUserData);

    if (ok) {
      setUpdateMessage(message || 'Perfil actualizado correctamente');
      setFormState(prevState => ({
        ...prevState,
        password: '',
        updatedAt: new Date().toISOString()
      }));
    } else {
      setUpdateMessage(errorMessage || 'Error al actualizar el perfil');
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  const { followers, following, getFollowers, getFollowing } = useContext(SocialContext);

  useEffect(() => {
    getFollowers(user.uid);
    getFollowing(user.uid);
  }, []);

  const socialModal = useModal();

  const [tittleModal, setTittleModal] = useState("");
  const [socialData, setSocialData] = useState(null);

  const openFollowersModal = () => {
    setTittleModal("Me siguen");
    setSocialData(followers);
    socialModal.openModal();
  };

  const openFollowingModal = () => {
    setTittleModal("Sigo a");
    setSocialData(following);
    socialModal.openModal();
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="col-md-4 col-lg-3 d-flex flex-column p-4 bg-dark text-white" style={{ minHeight: '100vh', fontSize: '1.1rem' }}>
          <div className="mb-4 text-center">
            <img
              src={user?.photoURL || '/default-profile.png'}
              alt="Foto de perfil"
              className="rounded-circle img-thumbnail"
              style={{ width: '120px', height: '120px', objectFit: 'cover' }}
            />
            <h4 className="mt-3">{user.displayName}</h4>
            
            

          </div>
          <button className="btn btn-light mb-3" onClick={openFollowersModal}>
            Seguidores <span className="badge bg-primary">{followers.length}</span>
          </button>
          <button className="btn btn-light mb-3" onClick={openFollowingModal}>
            Seguidos <span className="badge bg-primary">{following.length}</span>
          </button>
          <br />
          <p className="text-white">
            Creado el: {formState.createdAt && new Date(formState.createdAt).toLocaleDateString()}
          </p>
          <p className="text-white">
            Última actualización: {formState.updatedAt && new Date(formState.updatedAt).toLocaleDateString()}
          </p>

        </nav>
        <div className="col-md-8 col-lg-9 bg-light p-4">
          <h3 className="mb-4 text-center">Mi perfil</h3>
          <form onSubmit={handleUpdate}>
       
            <div className="mb-4">
              <label className="form-label">Cambiar foto de perfil</label>
              <input type="file" className="form-control" onChange={handleImageChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre de usuario</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Nombre de usuario"
                value={formState.username}
                onChange={handleChange}
                name="username"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                placeholder="Correo electrónico"
                value={formState.email || user?.googleEmail || ''}
                readOnly
                name="email"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nueva Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="Nueva Contraseña"
                value={formState.password}
                onChange={handleChange}
                name="password"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Bio</label>
              <textarea
                className="form-control"
                id="bio"
                name="bio"
                rows="3"
                placeholder="Bio"
                value={formState.bio}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <div className="d-grid gap-2">
              <button className="btn btn-primary" type="submit">
                Modificar
              </button>
              {updateMessage && (
                <p className={`mt-2 ${updateMessage.includes('Error') ? 'text-danger' : 'text-success'}`}>
                  {updateMessage}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    <ViewSocial isOpen={socialModal.isOpen} onClose={socialModal.closeModal}tittle={tittleModal} socialData={socialData}/>
   </div>
  );
};
            

