--
CREATE TABLE tb_task_archive (
  task_id int8 NOT NULL,
  task_state type_op_state NOT NULL,
  expect_start TIMESTAMP(0) NOT NULL,
  started_at TIMESTAMP(6),
  is_timeout boolean NOT NULL,
  timeout_intv interval NOT NULL,
  json jsonb,
  task_type_id int4 NOT NULL,
  task_type_ver int4 NOT NULL,
  ctime TIMESTAMP(6) NOT NULL,
  mtime TIMESTAMP(6),
  PRIMARY KEY (task_id)
);

COMMENT ON TABLE tb_task_archive IS 'TM任务归档';

CREATE INDEX CONCURRENTLY ON tb_task_archive USING BRIN (ctime);
CREATE INDEX CONCURRENTLY ON tb_task_archive USING BRIN (mtime);

CREATE INDEX CONCURRENTLY tb_task_archive_task_state_idx ON tb_task_archive (task_state);

CREATE INDEX CONCURRENTLY tb_task_archive_type_id_idx ON tb_task_archive (task_type_id);
CREATE INDEX CONCURRENTLY tb_task_archive_type_ver_idx ON tb_task_archive (task_type_ver);

--
