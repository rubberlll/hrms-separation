import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Select,
  Divider,
  Tag,
  Row,
  Col,
  Typography,
  message,
  Spin,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  SettingOutlined,
  SafetyOutlined,
  SolutionOutlined,
  BookOutlined,
} from "@ant-design/icons";
import AvatarUpload from "../../components/AvatarUpload";
import { useLoginStore } from "../../store/useLoginStore";

const { Title, Text } = Typography;

const roleMap = { admin: "管理员", hr: "人事", employee: "员工", user: "用户" };
const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: "激活", color: "green" },
  inactive: { label: "未激活", color: "default" },
  pending: { label: "待审核", color: "orange" },
};
const educationOptions = ["高中", "专科", "本科", "硕士", "博士"];
const employmentTypeOptions = ["全职", "兼职", "实习"];
const jobStatusOptions = ["在职", "离职", "求职中", "学生"];

export default function AccountSetting() {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  const { userInfo, setUserInfo } = useLoginStore();

  useEffect(() => {
    if (!userInfo?._id) return;
    setLoading(true);
    fetch(`/api/users/update-profile?userId=${userInfo._id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 200) {
          setUserData(res.data);
          form.setFieldsValue(res.data);
        } else {
          message.error(res.message || "获取用户信息失败");
        }
      })
      .finally(() => setLoading(false));
  }, [userInfo?._id, form]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };
  const handleSave = () => {
    form.validateFields().then((values) => {
      fetch("/api/users/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userInfo._id, ...values }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.code === 200) {
            setUserData(res.data);
            setUserInfo(res.data);
            setIsEditing(false);
            message.success("保存成功");
          } else {
            message.error(res.message || "保存失败");
          }
        });
    });
  };
  const handleAvatarUpload = (url: string) => {
    setUserData((prev: any) => ({ ...prev, avatar: url }));
    form.setFieldsValue({ avatar: url });
    fetch("/api/users/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userInfo._id, avatar: url }),
    }).then(() => {
      setUserInfo({ ...userInfo, avatar: url });
      message.success("头像已更新");
    });
  };

  if (loading || !userData) return <Spin style={{ margin: 80 }} />;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "32px auto",
        padding: 24,
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            账户设置
          </Title>
          <Text type="secondary">管理您的个人信息和账户设置</Text>
        </div>
        <div>
          {isEditing ? (
            <>
              <Button
                icon={<CloseOutlined />}
                style={{ marginRight: 8 }}
                onClick={handleCancel}
              >
                取消
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
              >
                保存更改
              </Button>
            </>
          ) : (
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              编辑资料
            </Button>
          )}
        </div>
      </div>
      <Form
        form={form}
        layout="vertical"
        initialValues={userData}
        disabled={!isEditing}
        style={{ width: "100%" }}
      >
        {/* 基本信息 */}
        <Card
          title={
            <>
              <UserOutlined /> 基本信息
            </>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={32} align="middle">
            <Col>
              <AvatarUpload
                src={userData.avatar}
                size={80}
                onUploadSuccess={handleAvatarUpload}
              />
            </Col>
            <Col flex={1}>
              <div style={{ marginBottom: 8 }}>
                <Tag color={statusMap[userData.status]?.color}>
                  {statusMap[userData.status]?.label}
                </Tag>
                <Tag>{roleMap[userData.role]}</Tag>
              </div>
              <Text type="secondary">
                入职时间:{" "}
                {userData.entryDate
                  ? new Date(userData.entryDate).toLocaleDateString("zh-CN")
                  : "未知"}
              </Text>
            </Col>
          </Row>
          <Divider />
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="用户名" name="username">
                {isEditing ? (
                  <Input prefix={<UserOutlined />} />
                ) : (
                  <Input
                    value={userData.username}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="昵称" name="nickname">
                {isEditing ? (
                  <Input />
                ) : (
                  <Input
                    value={userData.nickname}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="邮箱" name="email">
                {isEditing ? (
                  <Input prefix={<MailOutlined />} />
                ) : (
                  <Input
                    value={userData.email}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="手机号" name="phone">
                {isEditing ? (
                  <Input prefix={<PhoneOutlined />} />
                ) : (
                  <Input
                    value={userData.phone}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="所在地" name="location">
                {isEditing ? (
                  <Input prefix={<EnvironmentOutlined />} />
                ) : (
                  <Input
                    value={userData.location}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="雇佣类型" name="employmentType">
                {isEditing ? (
                  <Select>
                    {employmentTypeOptions.map((opt) => (
                      <Select.Option key={opt} value={opt}>
                        {opt}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    value={userData.employmentType}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="个人简介" name="bio">
                {isEditing ? (
                  <Input.TextArea rows={3} placeholder="请输入个人简介..." />
                ) : (
                  <Input.TextArea
                    value={userData.bio}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                    autoSize
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Card>
        {/* 教育背景 */}
        <Card
          title={
            <>
              <BookOutlined /> 教育背景
            </>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="学历" name="education">
                {isEditing ? (
                  <Select>
                    {educationOptions.map((opt) => (
                      <Select.Option key={opt} value={opt}>
                        {opt}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    value={userData.education}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="毕业年份" name="graduationYear">
                {isEditing ? (
                  <Input type="number" />
                ) : (
                  <Input
                    value={userData.graduationYear}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="毕业院校" name="school">
                {isEditing ? (
                  <Input />
                ) : (
                  <Input
                    value={userData.school}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="专业" name="major">
                {isEditing ? (
                  <Input />
                ) : (
                  <Input
                    value={userData.major}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Card>
        {/* 职业信息 */}
        <Card
          title={
            <>
              <SolutionOutlined /> 职业信息
            </>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="工作状态" name="jobStatus">
                {isEditing ? (
                  <Select>
                    {jobStatusOptions.map((opt) => (
                      <Select.Option key={opt} value={opt}>
                        {opt}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    value={userData.jobStatus}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="求职意向" name="jobIntention">
                {isEditing ? (
                  <Input placeholder="如：技术管理、产品经理等" />
                ) : (
                  <Input
                    value={userData.jobIntention}
                    readOnly
                    bordered
                    style={{ background: "#fafafa" }}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
      {/* 安全设置 */}
      <Card
        title={
          <>
            <SafetyOutlined /> 安全设置
          </>
        }
        style={{ marginBottom: 24 }}
      >
        <Form
          layout="inline"
          onFinish={({ password }) => {
            fetch("/api/users", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: userInfo._id, password }),
            })
              .then((res) => res.json())
              .then((res) => {
                if (res.code === 200) {
                  message.success("密码修改成功");
                } else {
                  message.error(res.message || "密码修改失败");
                }
              });
          }}
        >
          <Form.Item
            name="password"
            label="新密码"
            rules={[{ required: true, message: "请输入新密码" }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认密码"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              修改密码
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 16, color: "#888" }}>
          定期更新密码以保护账户安全
        </div>
      </Card>
    </div>
  );
}
