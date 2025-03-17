import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import request from "../utils/request";

interface User {
  id: string;
  key: string;
  username: string;
  role: string;
  email: string;
  phone?: string;
  status: "active" | "inactive" | "pending";
  department?: string;
  departmentId?: string;
  employmentType?: "全职" | "兼职" | "实习";
  entryDate?: string;
  avatar?: string;
  createdAt: string;
}

const PermissionManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // 获取所有用户数据
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await request.get("/users");
      setUsers(response.data.data);
      setFilteredUsers(response.data.data);
    } catch (error) {
      console.error("获取用户列表失败:", error);
      message.error("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 搜索用户
  const handleSearch = (values: any) => {
    const { username, role } = values;
    let result = [...users];

    if (username) {
      result = result.filter((user) =>
        user.username.toLowerCase().includes(username.toLowerCase())
      );
    }

    if (role) {
      result = result.filter((user) => user.role === role);
    }

    setFilteredUsers(result);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setFilteredUsers(users);
  };

  // 打开编辑权限模态框
  const showEditModal = (user: User) => {
    setCurrentUser(user);
    form.setFieldsValue({
      username: user.username,
      role: user.role,
      status: user.status,
    });
    setModalVisible(true);
  };

  // 打开修改密码模态框
  const showPasswordModal = (user: User) => {
    setCurrentUser(user);
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  // 更新用户权限
  const handleUpdatePermission = async (values: any) => {
    if (!currentUser) return;

    try {
      await request.put(`/users/${currentUser.id || currentUser.key}`, {
        role: values.role,
        status: values.status,
      });
      message.success("权限更新成功");
      setModalVisible(false);
      fetchUsers(); // 刷新用户列表
    } catch (error) {
      console.error("更新权限失败:", error);
      message.error("更新权限失败");
    }
  };

  // 更新用户密码
  const handleUpdatePassword = async (values: any) => {
    if (!currentUser) return;

    try {
      await request.put(`/users`, {
        userId: currentUser.id || currentUser.key,
        password: values.password,
      });
      message.success("密码更新成功");
      setPasswordModalVisible(false);
    } catch (error) {
      console.error("更新密码失败:", error);
      message.error("更新密码失败");
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 120,
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role) => {
        const roleMap: Record<string, string> = {
          admin: "管理员",
          hr: "HR",
          employee: "员工",
          user: "普通用户",
        };
        return roleMap[role] || role;
      },
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 180,
      ellipsis: true,
    },
    {
      title: "电话",
      dataIndex: "phone",
      key: "phone",
      width: 120,
      render: (phone) => phone || "-",
    },
    {
      title: "部门",
      dataIndex: "department",
      key: "department",
      render: (department) => department || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap: Record<string, string> = {
          active: "激活",
          inactive: "禁用",
          pending: "待审核",
        };
        return statusMap[status] || status;
      },
    },
    {
      title: "入职日期",
      dataIndex: "entryDate",
      key: "entryDate",
      render: (text) => text || "-",
    },
    {
      title: "雇佣类型",
      dataIndex: "employmentType",
      key: "employmentType",
      render: (type) => type || "-",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showEditModal(record)}>
            修改权限
          </Button>
          <Button type="link" onClick={() => showPasswordModal(record)}>
            重置密码
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="permission-management-container">
      <h1>权限管理</h1>

      {/* 搜索表单 */}
      <div style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入用户名" allowClear />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select placeholder="请选择角色" allowClear style={{ width: 150 }}>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="hr">HR</Select.Option>
              <Select.Option value="employee">员工</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={handleReset}>重置</Button>
          </Form.Item>
        </Form>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey={(record) => record.id || record.key}
        loading={loading}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        scroll={{ x: 1300 }}
        bordered
      />

      {/* 修改权限模态框 */}
      <Modal
        title="修改用户权限"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdatePermission}>
          <Form.Item name="username" label="用户名">
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: "请选择角色" }]}
          >
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="hr">HR</Select.Option>
              <Select.Option value="employee">员工</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select>
              <Select.Option value="active">激活</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
              <Select.Option value="pending">待审核</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改密码模态框 */}
      <Modal
        title="重置用户密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleUpdatePassword}
        >
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, message: "密码长度不能少于6个字符" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认密码" },
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
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PermissionManagement;
