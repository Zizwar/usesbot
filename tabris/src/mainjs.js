import { contentView, TextInput, TextView, Button, CheckBox, Picker, Composite, AlertDialog, ScrollView } from 'tabris';

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
 // console.log("datatatat,", data);

  const handleSubmit = async () => {
    const dataSubmit = { token: "", uuid: "" };

    formFields.forEach(field => {
      const value = field.input.text;
      if (value) dataSubmit[field.name] = value;
    });

    const token = dataSubmit["token"];
    delete dataSubmit.token;
    if (dataSubmit.clone) delete dataSubmit.uuid;

    const UUID = dataSubmit["uuid"];
    dataSubmit.permissions = JSON.parse(dataSubmit.permissions);

    console.log("start", { token, UUID, dataSubmit });

    const urlFetch = UUID
      ? `/api/mojo-update?token=${token}&uuid=${UUID}`
      : `/api/abrakadabra?token=${token}`;

    try {
      const response = await fetch(urlFetch, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataSubmit),
      });

      const responseData = await response.json();
      new AlertDialog({
        message: JSON.stringify({ responseData })
      }).open();
    } catch (error) {
      new AlertDialog({
        message: JSON.stringify({ error })
      }).open();
    }
  };

  const formFields = [];

  const createField = (name, label, type, icon) => {
    const composite = new Composite({ top: 'prev() 16', left: 16, right: 16 });

    new TextView({
      text: `${icon ? `🔑 ${icon} ` : ''}${label}`,
      font: 'bold 14px',
      left: 0, top: 0
    }).appendTo(composite);

    let input;
    if (type === 'select') {
      input = new Picker({
        itemCount: 2,
        itemText: index => index === 0 ? 'True' : 'False',
        selectionIndex: data[name] ? 0 : 1,
        left: 0, top: 'prev() 8'
      }).appendTo(composite);
    } else if (type === 'textarea') {
      input = new TextInput({
        text: name === "permissions" ? JSON.stringify(data[name]) : data[name],
        message: label,
        type: 'multiline',
        left: 0, right: 0, top: 'prev() 8'
      }).appendTo(composite);
    } else {
      input = new TextInput({
        text: data[name],
        message: label,
        //type: type,
        left: 0, right: 0, top: 'prev() 8'
      }).appendTo(composite);
    }

    formFields.push({ name, label, type, icon, input });

    return composite;
  };

const fields = [
  { name: "token", label: "توكن", type: "text", icon: "fa-key" },
  { name: "status", label: "الحالة", type: "text", icon: "fa-flag" },
  { name: "title_ar", label: "العنوان (عربي)", type: "text", icon: "fa-heading" },
  { name: "title_en", label: "العنوان (إنجليزي)", type: "text", icon: "fa-heading" },
  { name: "comment", label: "التعليق", type: "textarea", icon: "fa-comment" },
  { name: "method", label: "الطريقة", type: "text", icon: "fa-code" },
  { name: "endpoint", label: "النقطة النهائية", type: "text", icon: "fa-link" },
  { name: "table", label: "الجدول", type: "text", icon: "fa-table" },
  { name: "columns", label: "الأعمدة", type: "text", icon: "fa-columns" },
  { name: "prefix", label: "البادئة", type: "text", icon: "fa-code-branch" },
  { name: "single", label: "واحد فقط", type: "select", icon: "fa-circle-o-notch" },
  { name: "role", label: "الدور", type: "text", icon: "fa-user" },
  { name: "filters", label: "الفلاتر", type: "textarea", icon: "fa-filter" },
  { name: "select", label: "الاختيار", type: "text", icon: "fa-check" },
  { name: "permissions", label: "الصلاحيات", type: "textarea", icon: "fa-lock" },
  { name: "uuid", label: "معرّف UUID", type: "text", icon: "fa-id-badge" },
  { name: "clone", label: "استنساخ", type: "select", icon: "fa-clone" }
];

contentView.append(
  <ScrollView stretch>
    {fields.map(field => createField(field.name, field.label, field.type, field.icon))}
    <Button
      text="تحديث"
      onSelect={handleSubmit}
      stretchX
      centerX
      top="prev() 16"
      style="elevate"
    />
  </ScrollView>
);
