import React, { useEffect, useState } from "react";
import { Card, Spin, message, Table, Input, Button, Modal, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import request from "../utils/request";

interface EmployeeType {
  key: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  department: string;
  departmentId: string;
  entryDate: string;
  employmentType: string;
  avatar: string;
  createdAt: string;
}

const UserDetail: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [searchText, setSearchText] = useState("");

  // 获取所有用户数据
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await request.get("/users");
      console.log("API Response:", response.data);

      if (response.data.code === 200) {
        setEmployees(response.data.data);
      } else {
        message.error(
          `获取员工信息失败：${response.data.message || "未知错误"}`
        );
      }
    } catch (error) {
      console.error("获取员工信息失败:", error);
      message.error("获取员工信息失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 解雇员工
  const handleFire = async (employeeId: string) => {
    Modal.confirm({
      title: "确认解雇",
      content: "您确定要解雇该员工吗？",
      okText: "确认",
      cancelText: "取消",
      onOk: async () => {
        try {
          const response = await request.put(`/users/${employeeId}`, {
            status: "inactive",
            role: "user",
          });

          if (response.data.code === 200) {
            message.success("员工已解雇");
            // 更新员工列表
            fetchEmployees();
          } else {
            message.error(`解雇失败：${response.data.message || "未知错误"}`);
          }
        } catch (error) {
          console.error("解雇员工失败:", error);
          message.error("解雇员工失败");
        }
      },
    });
  };

  // 表格列定义
  const columns = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      filteredValue: [searchText],
      onFilter: (value: string, record: EmployeeType) =>
        record.username.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "电话",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "部门",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "入职日期",
      dataIndex: "entryDate",
      key: "entryDate",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "雇佣类型",
      dataIndex: "employmentType",
      key: "employmentType",
    },
    {
      title: "操作",
      key: "action",
      render: (text: React.ReactNode, record: EmployeeType) => (
        <Button
          danger
          onClick={() => handleFire(record.key)}
          disabled={record.status === "fired"}
        >
          解雇
        </Button>
      ),
    },
  ];

  // 筛选出role为employee的用户
  const employeeOnly = employees.filter(
    (employee) => employee.role === "employee"
  );

  if (loading) {
    return <Spin size="large" />;
  }

  if (!employees || employees.length === 0) {
    return <div>未找到员工信息</div>;
  }

  if (employeeOnly.length === 0) {
    return <div>未找到普通员工信息</div>;
  }

  return (
    <div>
      <h1>员工列表</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索员工姓名"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
        />
        <Button onClick={() => setSearchText("")}>清除搜索</Button>
      </Space>
      <Table
        dataSource={employeeOnly}
        columns={columns}
        rowKey="key"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default UserDetail;
