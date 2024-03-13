import React from 'react';
import '../css/call.css';
import patition from '../image/partition.PNG';
import video from '../image/video.PNG';

const Call = () => {
  return (
    <div className='container-call'>
      <div className='row1-call'>
        <div className='clock'>
           <h1 className='dsch'>Time</h1>
        </div>
        <div className='ds'>
          <p className='dsch'>Danh sách cuộc họp</p>
        </div>
      </div>
      <div className='row2-call'>
        <div className='img'>
          <figure>
            <img src={patition} alt='Logo1' />
            <figcaption>Tham dự cuộc họp</figcaption>
          </figure>
          
          <figure>
            <img src={video} alt='Logo2' />
            <figcaption>Tạo cuộc họp</figcaption>
          </figure>
        </div>
        <h1 className='h1-call'>Chưa có cuộc họp nào hôm nay !</h1>
      </div>
    </div>
  );
};

export default Call;



