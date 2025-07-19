import React from "react";
import { Drawer } from "antd";
import UserProfileForm from "../UserProfileForm";

interface Props {
  open: boolean;
  onClose: () => void;
  userInfo: any;
}

const UserProfileDrawer: React.FC<Props> = ({ open, onClose, userInfo }) => (
  <Drawer
    title="编辑个人信息"
    open={open}
    onClose={onClose}
    width="50vw"
    destroyOnClose
  >
    <UserProfileForm initialValues={userInfo} onFinish={() => {}} />
  </Drawer>
);

export default UserProfileDrawer;
