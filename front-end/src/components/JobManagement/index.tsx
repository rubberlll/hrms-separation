import React, { useState, useEffect } from "react";
import { Card, Tabs } from "antd";
import { useJobStore } from "../../store/useJobStore";
import JobForm from "../JobForm";
import JobList from "../JobList";
import "./index.less";

const { TabPane } = Tabs;

const JobManagement: React.FC = () => {
  const { fetchJobs } = useJobStore();
  const [activeTab, setActiveTab] = useState<string>("publish");
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleEdit = (jobId: string) => {
    setEditingJobId(jobId);
    setActiveTab("publish");
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
  };

  return (
    <div className="job-management-container">
      <Card className="job-management-card" bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="job-management-tabs"
          type="card"
        >
          <TabPane tab={editingJobId ? "编辑职位" : "发布新职位"} key="publish">
            <JobForm
              editingJobId={editingJobId}
              onCancelEdit={handleCancelEdit}
            />
          </TabPane>
          <TabPane tab="查看已发布职位" key="list">
            <JobList onEdit={handleEdit} />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default JobManagement;
