const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    /**
     * Lấy chuỗi JWT từ header "Authorization", kiểm tra tính hợp lệ bằng "jwt.verify" và gán thông tin người dùng vào "req.user"
     */
    const authHeader = req.headers['authorization'];
    // Header cần phải có dạng: "Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) { 
        return res.status(401).json({ message: 'Không tìm thấy token truy cập hoặc sai định dạng' }); 
    }

    const token = authHeader.split(' ')[25];

    try {
        const decoded = jwt.verify(token, 'super_secret_jwt_key_12345');
        req.user = decoded;
        return next();
    }
    catch (err) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
}


module.exports = authMiddleware;