import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  message,
  Row,
  Col,
} from "antd";
import { useJobStore } from "../store/useJobStore";
import { useLoginStore } from "../store/useLoginStore";
import dayjs from "dayjs";
import request from "../utils/request";
// import "./JobForm.less";

const { TextArea } = Input;
const { Option } = Select;

interface JobFormProps {
  editingJobId: string | null;
  onCancelEdit: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ editingJobId, onCancelEdit }) => {
  const { jobs, addJob, updateJob, loading } = useJobStore();
  const { userInfo } = useLoginStore();
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (editingJobId) {
      const jobToEdit = jobs.find((job) => job._id === editingJobId);
      if (jobToEdit) {
        const departmentId =
          typeof jobToEdit.department === "object"
            ? jobToEdit.department._id
            : jobToEdit.department;
        form.setFieldsValue({
          title: jobToEdit.title,
          department: departmentId,
          description: jobToEdit.description,
          location: jobToEdit.location,
          salaryRange: jobToEdit.salaryRange || "",
          status: jobToEdit.status,
          jobType: jobToEdit.jobType,
          expiryDate: jobToEdit.expiryDate
            ? dayjs(jobToEdit.expiryDate)
            : undefined,
        });
      }
    } else {
      form.resetFields();
    }
  }, [editingJobId, jobs, form]);

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await request.get("/departments");
      if (response.data.code === 200) {
        setDepartments(response.data.data);
      } else {
        message.error(`获取部门列表失败: ${response.data.message}`);
        setDepartments([]);
      }
    } catch (error) {
      message.error("获取部门列表失败");
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      if (editingJobId) {
        await updateJob(editingJobId, {
          ...values,
          expiryDate: values.expiryDate
            ? values.expiryDate.format("YYYY-MM-DD")
            : undefined,
        });
        message.success("职位更新成功");
        onCancelEdit();
      } else {
        if (!userInfo?._id) {
          message.error("无法获取用户信息，请重新登录");
          return;
        }
        await addJob(
          {
            ...values,
            expiryDate: values.expiryDate
              ? values.expiryDate.format("YYYY-MM-DD")
              : undefined,
          },
          userInfo._id
        );
        message.success("职位发布成功");
        form.resetFields();
      }
    } catch (error) {
      message.error("操作失败，请稍后重试");
    }
  };

  return (
    <div className="job-form-container">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="job-form"
      >
        <Form.Item
          label="职位名称"
          name="title"
          rules={[{ required: true, message: "请输入职位名称" }]}
        >
          <Input placeholder="请输入职位名称" />
        </Form.Item>
        <Form.Item
          label="部门"
          name="department"
          rules={[{ required: true, message: "请选择部门" }]}
        >
          <Select
            placeholder="请选择部门"
            loading={departmentsLoading}
            allowClear
          >
            {departments.map((dept) => (
              <Option key={dept._id} value={dept._id}>
                {dept.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="职位描述"
          name="description"
          rules={[{ required: true, message: "请输入职位描述" }]}
        >
          <TextArea rows={4} placeholder="请输入职位描述" />
        </Form.Item>
        <Form.Item
          label="工作地点"
          name="location"
          rules={[{ required: true, message: "请输入工作地点" }]}
        >
          <Input placeholder="请输入工作地点" />
        </Form.Item>
        <Form.Item label="薪资范围" name="salaryRange">
          <Input placeholder="请输入薪资范围，例如：15k-25k" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="职位状态"
              name="status"
              rules={[{ required: true, message: "请选择职位状态" }]}
              initialValue="open"
            >
              <Select placeholder="请选择职位状态">
                <Option value="open">开放中</Option>
                <Option value="closed">已关闭</Option>
                <Option value="archived">已归档</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="招聘类型" name="jobType">
              <Select placeholder="请选择招聘类型">
                <Option value="社招">社招</Option>
                <Option value="校招">校招</Option>
                <Option value="实习">实习</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="截止日期" name="expiryDate">
          <DatePicker style={{ width: "100%" }} placeholder="请选择截止日期" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {editingJobId ? "更新职位" : "发布职位"}
          </Button>
          {editingJobId && (
            <Button style={{ marginLeft: 12 }} onClick={onCancelEdit}>
              取消
            </Button>
          )}
        </Form.Item>
      </Form>
    </div>
  );
};

export default JobForm;
