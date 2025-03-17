import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import request from "../../utils/request";
import type { ColumnsType } from "antd/es/table";

interface Department {
  _id: string;
  name: string;
  description: string;
  parentDepartment?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("新增部门");
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  // 获取部门列表
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await request.get("/departments");
      setDepartments(response.data.data);
    } catch (error) {
      console.error("获取部门列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 表格列定义
  const columns: ColumnsType<Department> = [
    {
      title: "部门名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "部门描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "上级部门",
      dataIndex: ["parentDepartment", "name"],
      key: "parentDepartment",
      render: (text, record) => record.parentDepartment?.name || "无",
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
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个部门吗?"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理新增部门
  const handleAdd = () => {
    setModalTitle("新增部门");
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑部门
  const handleEdit = (record: Department) => {
    setModalTitle("编辑部门");
    setEditingId(record._id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      parentDepartment: record.parentDepartment?._id,
    });
    setModalVisible(true);
  };

  // 处理删除部门
  const handleDelete = async (id: string) => {
    try {
      await request.delete(`/departments/${id}`);
      message.success("删除部门成功");
      fetchDepartments();
    } catch (error) {
      console.error("删除部门失败:", error);
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingId) {
        // 更新部门
        await request.put(`/departments/${editingId}`, values);
        message.success("更新部门成功");
      } else {
        // 创建部门
        await request.post("/departments", values);
        message.success("创建部门成功");
      }

      setModalVisible(false);
      fetchDepartments();
    } catch (error) {
      console.error("提交表单失败:", error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增部门
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={departments}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: "请输入部门名称" }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>

          <Form.Item name="description" label="部门描述">
            <Input.TextArea placeholder="请输入部门描述" rows={4} />
          </Form.Item>

          <Form.Item name="parentDepartment" label="上级部门">
            <Select placeholder="请选择上级部门" allowClear>
              {departments.map((dept) => (
                <Select.Option
                  key={dept._id}
                  value={dept._id}
                  disabled={editingId === dept._id} // 防止选择自己作为上级部门
                >
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
