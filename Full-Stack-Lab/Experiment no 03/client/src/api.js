const API_BASE = '/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchStudents(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.department) query.append('department', params.department);
  if (params.semester) query.append('semester', params.semester);
  if (params.status) query.append('status', params.status);

  const res = await fetch(`${API_BASE}/students?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function fetchStudentById(id) {
  const res = await fetch(`${API_BASE}/students/${id}`);
  if (!res.ok) throw new Error('Failed to fetch student details');
  return res.json();
}

export async function createStudent(data) {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create student');
  return json;
}

export async function updateStudent(id, data) {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update student');
  return json;
}

export async function deleteStudent(id) {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete student');
  return res.json();
}

export async function fetchSubjects() {
  const res = await fetch(`${API_BASE}/subjects`);
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
}

export async function createSubject(data) {
  const res = await fetch(`${API_BASE}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create subject');
  return json;
}

export async function updateSubject(id, data) {
  const res = await fetch(`${API_BASE}/subjects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update subject');
  return json;
}

export async function deleteSubject(id) {
  const res = await fetch(`${API_BASE}/subjects/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete subject');
  return res.json();
}

export async function fetchMarks(studentId) {
  const url = studentId ? `${API_BASE}/marks?student_id=${studentId}` : `${API_BASE}/marks`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch marks');
  return res.json();
}

export async function saveMarks(data) {
  const res = await fetch(`${API_BASE}/marks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to record marks');
  return json;
}

export async function deleteMark(id) {
  const res = await fetch(`${API_BASE}/marks/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete marks');
  return res.json();
}

export async function updateDocumentStatus(id, status) {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
}
