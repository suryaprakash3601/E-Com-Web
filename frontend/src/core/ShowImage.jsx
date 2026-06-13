import React, { useState } from 'react';
import { API } from '../config';

const ShowImage = ({ item, url }) => {
  const [imgSrc, setImgSrc] = useState(`${API}/${url}/photo/${item._id}`);

  const handleError = () => {
    // Fallback placeholder image when real image is missing or errors out
    setImgSrc(`https://picsum.photos/seed/${item._id}/400/300`);
  };

  return (
    <div className='product-img' style={{ height: '190px', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      <img
        src={imgSrc}
        alt={item.name}
        onError={handleError}
        style={{ 
          objectFit: 'cover', 
          height: '100%', 
          width: '100%', 
          transition: 'transform 0.4s ease-in-out' 
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1.0)'}
      />
    </div>
  );
};

export default ShowImage;
