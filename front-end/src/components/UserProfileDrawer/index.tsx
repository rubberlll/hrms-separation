import React from "react";
import { Drawer } from "antd";
import UserProfileForm from "../UserProfileForm";
import request from "../../utils/request";
import { useLoginStore } from "../../store/useLoginStore";

interface Props {
  open: boolean;
  onClose: () => void;
  userInfo: any;
}

const UserProfileDrawer: React.FC<Props> = ({ open, onClose, userInfo }) => {
  const [loading, setLoading] = React.useState(false);
  const setUserInfo = useLoginStore((state) => state.setUserInfo);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      await request.put("/users/update-profile", {
        userId: userInfo.userId,
        ...values,
      });
      // 获取最新用户信息并更新前端状态
      console.log("userId for GET request:", userInfo.userId);
      const userId = userInfo.userId || userInfo._id;
      if (!userId) {
        console.error("No userId found in userInfo:", userInfo);
        onClose();
        return;
      }
      const res = await request.get(`/users/update-profile?userId=${userId}`);
      if (res.data?.data) {
        setUserInfo(res.data.data);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="编辑个人信息"
      open={open}
      onClose={onClose}
      width="50vw"
      destroyOnClose
    >
      <UserProfileForm
        initialValues={userInfo}
        onFinish={handleFinish}
        loading={loading}
        onCancel={onClose}
      />
    </Drawer>
  );
};

export default UserProfileDrawer;
