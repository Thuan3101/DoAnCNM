import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/caiDat.css';
import '../components/dangnhap.js';

const CaiDatLayout = ({ currentTab, handleTabChange }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xử lý đăng xuất ở đây, ví dụ xoá thông tin đăng nhập, xoá token xác thực, vv.
    // Sau đó, chuyển hướng người dùng về trang đăng nhập
    navigate("/dangnhap");
  };

  return (
    <div className='container'>
      <div className='row1'>
        <div className='chat-list'>
          <h2>Cài đặt</h2>
          <ul>
            <li onClick={() => handleTabChange('thongTin')}>Thông tin</li>
            <li onClick={() => handleTabChange('caiDat')}>Setting</li>
            <li onClick={() => handleTabChange('ngonNgu')}>Ngôn ngữ</li>
            <li onClick={handleLogout}>Đăng xuất</li> {/* Thêm xử lý cho nút đăng xuất */}
          </ul>
        </div>
      </div>
    <div className='row2'>
      <div className='titleAria'></div>
   
      {currentTab === 'thongTin' && (
        <div className='thong-tin'>
          <text className='title'>Hiển thị</text> <br></br>
          <text className='title2'>Nội dung cho tab Thông tin</text>
        </div>
      )}

      {currentTab === 'caiDat' && (
        <div className='cai-dat'>
          <text className='title'>Hiển thị</text> <br></br>
          <text className='title2'>Nội dung cho tab Cài đặt</text>
          <ul>
            <li onClick={() => handleTabChange('chung')}>Chung</li>
            <li onClick={() => handleTabChange('riengTu')}>Riêng tư</li>
            <li onClick={() => handleTabChange('quanLiDuLieu')}>Quản lí dữ liệu</li>
            <li onClick={() => handleTabChange('giaoDien')}>Giao diện</li>
          </ul>
        </div>
      )}

      {currentTab === 'ngonNgu' && (
        <div className='ngon-ngu'>
          <text className='title'>Hiển thị</text> <br></br>
          <text className='title2'>Nội dung cho tab Ngôn ngữ</text>
        </div>
      )}

      {currentTab === 'dangXuat' && (
        <div className='dang-xuat'>
          <text className='title'>Hiển thị</text> <br></br>
          <text className='title2'>Nội dung cho tab Đăng xuất</text>
        </div>
      )}

      {currentTab === 'chung' && (
        <div className='chung'>
          <text className='title'>Hiển thị</text> <br></br>
          <text className='title2'>Nội dung cho cài đặt chung</text>
        </div>
      )}

      {currentTab === 'riengTu' && (
        <div className='rieng-tu'>
          <text className='title'>Hiển thị</text> <br></br>
          <text className='title2'>Nội dung cho cài đặt riêng tư</text>
        </div>
      )}

      {currentTab === 'quanLiDuLieu' && (
        <div className='quan-li-du-lieu'>
          <text className='title'>Hiển thị</text> <br></br>
          <text className='title2'>Nội dung cho cài đặt quản lí dữ liệu</text>
        </div>
      )}

      {currentTab === 'giaoDien' && (
        <div className='giao-dien'>
          <text className='title'>Hiển thị</text> <br></br>
          <text className='title2'>Nội dung cho cài đặt giao diện</text>
        </div>
      )}
    </div>
  </div>
);
};

const CaiDat = () => {
  const [currentTab, setCurrentTab] = useState(null);

  const handleTabChange = (tabName) => {
    setCurrentTab(tabName);
  };

  return (
    <CaiDatLayout currentTab={currentTab} handleTabChange={handleTabChange} />
  );
};

export default CaiDat;
