import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Table,
  Tag,
  Space,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import request from "../../utils/request";
import "./index.less";

interface Department {
  _id: string;
  name: string;
  description: string;
  parentDepartment?: string;
  children?: Department[];
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}
interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  entryDate?: string;
  role: string;
  status: string;
}

const buildDeptTree = (list: Department[]): Department[] => {
  const map = new Map<string, Department>();
  const roots: Department[] = [];
  list.forEach((item) => {
    map.set(item._id, { ...item, children: [] });
  });
  list.forEach((item) => {
    const parentId =
      (item.parentDepartment as any)?._id || item.parentDepartment;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children!.push(map.get(item._id)!);
    } else {
      roots.push(map.get(item._id)!);
    }
  });
  return roots;
};

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptTree, setDeptTree] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [deptModal, setDeptModal] = useState({
    visible: false,
    editing: false,
    record: null as Department | null,
  });
  const [empModal, setEmpModal] = useState({
    visible: false,
    editing: false,
    record: null as User | null,
  });
  const [form] = Form.useForm();
  const [empForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 获取部门树
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await request.get("/departments");
      if (res.data.code === 200) {
        setDepartments(res.data.data);
        setDeptTree(buildDeptTree(res.data.data));
      }
    } catch (e) {
      message.error("获取部门失败");
    } finally {
      setLoading(false);
    }
  };

  // 获取选中部门的员工（用User接口）
  const fetchEmployees = async (deptId: string) => {
    try {
      const res = await request.get(`/users?department=${deptId}`);
      if (res.data.code === 200) {
        setUsers(res.data.data.filter((u: any) => u.department));
      }
    } catch (e) {
      message.error("获取员工失败");
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);
  useEffect(() => {
    if (selectedDept) fetchEmployees(selectedDept._id);
  }, [selectedDept]);

  // 递归渲染部门树
  const renderTree = (depts: Department[], level = 0) =>
    depts.map((dept) => (
      <div
        key={dept._id}
        className="dept-tree-row"
        data-level={level}
        style={{}}
      >
        <div
          className={`dept-tree-item ${
            selectedDept?._id === dept._id ? "selected" : ""
          }`}
          onClick={() => setSelectedDept(dept)}
        >
          {dept.children && (
            <span
              className="expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedKeys((keys) =>
                  keys.includes(dept._id)
                    ? keys.filter((k) => k !== dept._id)
                    : [...keys, dept._id]
                );
              }}
            >
              {expandedKeys.includes(dept._id) ? "▼" : "▶"}
            </span>
          )}
          <span className="dept-name">{dept.name}</span>
          <Tag color="orange" className="ml-2">
            {dept.employeeCount ?? 0}人
          </Tag>
        </div>
        {dept.children &&
          expandedKeys.includes(dept._id) &&
          renderTree(dept.children, level + 1)}
      </div>
    ));

  // 获取所有部门的扁平列表
  const getAllDepartments = (depts: Department[]): Department[] => {
    let result: Department[] = [];
    depts.forEach((dept) => {
      result.push(dept);
      if (dept.children)
        result = result.concat(getAllDepartments(dept.children));
    });
    return result;
  };

  // 新增/编辑部门
  const handleDeptSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (deptModal.editing && deptModal.record) {
        await request.put(`/departments/${deptModal.record._id}`, values);
        message.success("编辑成功");
      } else {
        await request.post("/departments", values);
        message.success("新增成功");
      }
      setDeptModal({ ...deptModal, visible: false });
      fetchDepartments();
    } catch (e) {
      message.error("操作失败");
    }
  };
  // 删除部门
  const handleDeptDelete = async (id: string) => {
    try {
      await request.delete(`/departments/${id}`);
      message.success("删除成功");
      fetchDepartments();
      setSelectedDept(null);
    } catch (e) {
      message.error("删除失败");
    }
  };

  // 新增/编辑员工
  const handleEmpSubmit = async () => {
    try {
      const values = await empForm.validateFields();
      if (empModal.editing && empModal.record) {
        await request.put(`/users/${empModal.record._id}`, values);
        message.success("编辑成功");
      } else {
        await request.post("/users", {
          ...values,
          department: selectedDept?._id,
        });
        message.success("新增成功");
      }
      setEmpModal({ ...empModal, visible: false });
      if (selectedDept) fetchEmployees(selectedDept._id);
    } catch (e) {
      message.error("操作失败");
    }
  };
  // 删除员工
  const handleEmpDelete = async (id: string) => {
    try {
      await request.delete(`/users/${id}`);
      message.success("删除成功");
      if (selectedDept) fetchEmployees(selectedDept._id);
    } catch (e) {
      message.error("删除失败");
    }
  };

  // 员工表格columns
  const userColumns = [
    { title: "姓名", dataIndex: "username" },
    { title: "职位", dataIndex: "position" },
    { title: "邮箱", dataIndex: "email" },
    { title: "电话", dataIndex: "phone" },
    {
      title: "入职时间",
      dataIndex: "entryDate",
      render: (t: string) => (t ? new Date(t).toLocaleDateString() : "-"),
    },
    { title: "角色", dataIndex: "role" },
    { title: "状态", dataIndex: "status" },
    {
      title: "操作",
      render: (_: any, record: User) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEmpModal({ visible: true, editing: true, record });
              empForm.setFieldsValue(record);
            }}
          >
            编辑
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleEmpDelete(record._id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="dept-page">
      <div className="dept-header">
        <h1>部门管理</h1>
        <p>管理公司组织架构和员工信息</p>
      </div>
      <div className="dept-main">
        {/* 左侧部门树 */}
        <Card className="dept-tree-card">
          <div className="dept-tree-header">
            <span>组织架构</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setDeptModal({ visible: true, editing: false, record: null });
                form.resetFields();
              }}
            >
              新增
            </Button>
          </div>
          <div className="dept-tree-body">{renderTree(deptTree)}</div>
        </Card>
        {/* 右侧详情 */}
        <div className="dept-detail">
          {selectedDept ? (
            <>
              <Card className="dept-detail-card">
                <div className="dept-detail-header">
                  <span className="dept-detail-title">{selectedDept.name}</span>
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        setDeptModal({
                          visible: true,
                          editing: true,
                          record: selectedDept,
                        });
                        form.setFieldsValue({
                          name: selectedDept.name,
                          description: selectedDept.description,
                          parentDepartment:
                            selectedDept.parentDepartment || undefined,
                        });
                      }}
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="确定删除该部门？"
                      onConfirm={() => handleDeptDelete(selectedDept._id)}
                    >
                      <Button icon={<DeleteOutlined />} danger>
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
                <div className="dept-detail-desc">
                  {selectedDept.description}
                </div>
              </Card>
              <Card className="dept-emp-card">
                <div className="dept-emp-header">
                  <span>部门员工</span>
                  <Button
                    icon={<UserAddOutlined />}
                    onClick={() => {
                      setEmpModal({
                        visible: true,
                        editing: false,
                        record: null,
                      });
                      empForm.resetFields();
                    }}
                  >
                    添加员工
                  </Button>
                </div>
                <Table
                  dataSource={users}
                  columns={userColumns}
                  rowKey="_id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </>
          ) : (
            <Card
              className="dept-detail-card"
              style={{ textAlign: "center", padding: 48 }}
            >
              <h3>请选择左侧部门查看详情</h3>
            </Card>
          )}
        </div>
      </div>
      {/* 部门弹窗 */}
      <Modal
        title={deptModal.editing ? "编辑部门" : "新增部门"}
        open={deptModal.visible}
        onOk={handleDeptSubmit}
        onCancel={() => setDeptModal({ ...deptModal, visible: false })}
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
              {getAllDepartments(departments)
                .filter(
                  (dept) =>
                    !deptModal.record || dept._id !== deptModal.record._id
                )
                .map((dept) => (
                  <Select.Option key={dept._id} value={dept._id}>
                    {dept.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      {/* 员工弹窗 */}
      <Modal
        title={empModal.editing ? "编辑员工" : "添加员工"}
        open={empModal.visible}
        onOk={handleEmpSubmit}
        onCancel={() => setEmpModal({ ...empModal, visible: false })}
        okText="确定"
        cancelText="取消"
      >
        <Form form={empForm} layout="vertical">
          <Form.Item
            name="username"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            {" "}
            <Input placeholder="请输入姓名" />{" "}
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: "请输入邮箱" }]}
          >
            {" "}
            <Input placeholder="请输入邮箱" />{" "}
          </Form.Item>
          <Form.Item name="phone" label="电话">
            {" "}
            <Input placeholder="请输入电话" />{" "}
          </Form.Item>
          <Form.Item name="position" label="职位">
            {" "}
            <Input placeholder="请输入职位" />{" "}
          </Form.Item>
          <Form.Item name="entryDate" label="入职时间">
            {" "}
            <Input placeholder="例如：2024-01-01" />{" "}
          </Form.Item>
          <Form.Item name="role" label="角色">
            {" "}
            <Select>
              <Select.Option value="employee">员工</Select.Option>
              <Select.Option value="hr">HR</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>{" "}
          </Form.Item>
          <Form.Item name="status" label="状态">
            {" "}
            <Select>
              <Select.Option value="active">在职</Select.Option>
              <Select.Option value="inactive">离职</Select.Option>
              <Select.Option value="pending">待激活</Select.Option>
            </Select>{" "}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
