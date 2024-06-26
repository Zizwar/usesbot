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
      ? `https://mojoland.deno.dev/api/mojo-update?token=${token}&uuid=${UUID}`
      : `https://mojoland.deno.dev/api/abrakadabra?token=${token}`;

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
      text: `${icon} ${name}`,
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
    { name: "token", label: "توكن", type: "text", icon: "🔑" },
    { name: "status", label: "الحالة", type: "text", icon: "🚩" },
    { name: "title_ar", label: "العنوان (عربي)", type: "text", icon: "📝" },
    { name: "title_en", label: "العنوان (إنجليزي)", type: "text", icon: "📝" },
    { name: "comment", label: "التعليق", type: "textarea", icon: "💬" },
    { name: "method", label: "الطريقة", type: "text", icon: "⚙️" },
    { name: "endpoint", label: "النقطة النهائية", type: "text", icon: "🔗" },
    { name: "table", label: "الجدول", type: "text", icon: "📊" },
    { name: "columns", label: "الأعمدة", type: "text", icon: "📋" },
    { name: "prefix", label: "البادئة", type: "text", icon: "🔤" },
    { name: "single", label: "واحد فقط", type: "select", icon: "1️⃣" },
    { name: "role", label: "الدور", type: "text", icon: "👤" },
    { name: "filters", label: "الفلاتر", type: "textarea", icon: "⚗️" },
    { name: "select", label: "الاختيار", type: "text", icon: "✅" },
    { name: "permissions", label: "الصلاحيات", type: "textarea", icon: "🔒" },
    { name: "uuid", label: "معرّف UUID", type: "text", icon: "🆔" },
    { name: "clone", label: "استنساخ", type: "select", icon: "📄" }
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
