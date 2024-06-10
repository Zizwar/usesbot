
import { Button, TextInput, TextView, ScrollView, Picker, CheckBox,contentView,Composite  } from 'tabris';


const fields = [
  { name: 'token', label: 'توكن', type: 'text', icon: 'fa-key' },
  { name: 'status', label: 'الحالة', type: 'text', icon: 'fa-flag' },
  { name: 'title_ar', label: 'العنوان (عربي)', type: 'text', icon: 'fa-heading' },
  { name: 'title_en', label: 'العنوان (إنجليزي)', type: 'text', icon: 'fa-heading' },
  { name: 'comment', label: 'التعليق', type: 'textarea', icon: 'fa-comment' },
  { name: 'method', label: 'الطريقة', type: 'text', icon: 'fa-code' },
  { name: 'endpoint', label: 'النقطة النهائية', type: 'text', icon: 'fa-link' },
  { name: 'table', label: 'الجدول', type: 'text', icon: 'fa-table' },
  { name: 'columns', label: 'الأعمدة', type: 'text', icon: 'fa-columns' },
  { name: 'prefix', label: 'البادئة', type: 'text', icon: 'fa-code-branch' },
  { name: 'single', label: 'واحد فقط', type: 'select', icon: 'fa-circle-o-notch' },
  { name: 'role', label: 'الدور', type: 'text', icon: 'fa-user' },
  { name: 'filters', label: 'الفلاتر', type: 'textarea', icon: 'fa-filter' },
  { name: 'select', label: 'الاختيار', type: 'text', icon: 'fa-hand-pointer' },
  { name: 'permissions', label: 'التصاريح', type: 'textarea', icon: 'fa-key' },
  { name: 'function', label: 'الدالة', type: 'textarea', icon: 'fa-code' },
  { name: 'rpc', label: 'RPC', type: 'text', icon: 'fa-network-wired' },
  { name: 'text', label: 'النص', type: 'textarea', icon: 'fa-note' },
  { name: 'data', label: 'البيانات', type: 'textarea', icon: 'fa-database' },
  { name: 'sql', label: 'استعلام مخصص', type: 'text', icon: 'fa-terminal' },
  { name: 'log', label: 'السجل', type: 'select', icon: 'fa-file-alt' }
];
const data = {
  token: 'abc123',
  status: 'active',
  title_ar: 'عنوان باللغة العربية',
  title_en: 'Title in English',
  comment: 'This is a comment.',
  method: 'GET',
  endpoint: '/api/data',
  table: 'users',
  columns: 'name, email, age',
  prefix: 'app_',
  single: true,
  role: 'admin',
  filters: 'age > 18 AND role = "user"',
  select: 'option1',
  permissions: '{"read": true, "write": false}',
  funciton: 'function() { return "Hello world!"; }',
  rpc: 'rpc endpoint',
  text: 'Some text here.',
  data: '{"name": "John", "age": 30}',
  sql: 'SELECT * FROM users',
  log: true
};

const handleSubmit = async (e) => {
  //e.preventDefault();

  //const formData = new FormData(e.target);
  const formData = {};
  const dataSubmit = { token: '', uuid: '' };

  for (let [name, value] of formData.entries()) {
    if (value) dataSubmit[name] = value;
  }
  const token = dataSubmit['token'];
  delete dataSubmit.token;
  if (dataSubmit.clone) delete dataSubmit.uuid;

  const UUID = dataSubmit['uuid'];

  dataSubmit.permissions = JSON.parse(dataSubmit.permissions);

  console.log('start', { token, UUID, dataSubmit });

  const urlFetch = UUID
    ? `/api/mojo-update?token=${token}&uuid=${UUID}`
    : `/api/abrakadabra?token=${token}`;

  try {
    const response = await fetch(urlFetch, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataSubmit)
    });

    const responseData = await response.json();
    alert(JSON.stringify({ responseData }));
    // Handle response from the API
  } catch (error) {
    alert(JSON.stringify({ error }));
    // Handle error
  }
};


contentView.append(
<ScrollView stretch>
      <Composite stretchX padding={16}>
        <TextView
          left={16} top={16} text="Mojo Land"
          font='bold 24px'
        />
        <Composite stretchX padding={16} top='prev() 8' background='white'>
          {Object.keys(data).map((fieldName) => (
            <FormField
              key={fieldName}
              name={fieldName}
              label={fieldName}
              type={typeof data[fieldName] === "string" ? "text" : "textarea"}
              value={data[fieldName]}
            />
          ))}
          <Composite left={16} right={16} top='prev() 8' padding={16}>
            <TextInput name="uuid" type="hidden" text={data.uuid} />
            <CheckBox left={0} text='clone' name="clone" checked={data.clone} />
            <Button
              centerX top='prev() 8'
              text='Save'
              onSelect={handleSubmit}
              background='blue'
              textColor='white'
            />
          </Composite>
        </Composite>
      </Composite>
    </ScrollView>
 
);

function FormField({ name, label, type, value }) {
  return (
    <Composite stretchX>
      <TextView
        left={16} top='prev() 8'
        text={label}
      />
      {type === "textarea" ? (
        <TextInput
          left={16} right={16} top='prev() 8'
          type='multiline'
          text={value}
        />
      ) : (
        <TextInput
          left={16} right={16} top='prev() 8'
          type='text'
          text={value}
        />
      )}
    </Composite>
  );
}