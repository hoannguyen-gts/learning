1. **Tiêu đề ứng dụng**: Chữ hiển thị hoa `"TODOS"` đặt ở trên cùng.
2. **Khu vực nhập liệu**:
   - Ô nhập văn bản (`input`) có placeholder `"Enter your task..."`.
   - Nút gửi (`button`) hiển thị chữ `"Submit"`.
   - **Quy tắc chặn (Validation)**: Nút `Submit` phải bị vô hiệu hóa (`disabled`) khi ô nhập liệu trống hoặc chỉ toàn khoảng trắng.
3. **Danh sách tác vụ (Task List)**:
   - Khi nhấn `Submit`, task mới nhất phải được **chèn lên đầu danh sách** (vị trí số 1 trong danh sách hiển thị).
   - Mỗi dòng task hiển thị rõ ràng: *Số thứ tự. Nội dung tác vụ* và *Thời gian tạo* (định dạng `hh:mm DD/MM/YYYY`, ví dụ: `13:40 03/09/2026`).
   - Cạnh phải của mỗi task gồm: một ô chọn (`checkbox`) và một nút `"Xóa"` bên ngoài cùng.
4. **Tương tác**:
   - Nhấp vào `checkbox` sẽ chuyển đổi trạng thái hoàn thành của task (áp dụng CSS gạch ngang qua chữ `text-decoration: line-through` và giảm độ mờ để biểu thị trạng thái đã làm xong).
   - Nhấp vào nút `"Xóa"` sẽ loại bỏ vĩnh viễn task ra khỏi danh sách dữ liệu và giao diện.