import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email є обовʼязковим полем'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Пароль є обовʼязковим полем'],
      minlength: [8, 'Пароль має містити мінімум 8 символів'],
    },
  },
  { versionKey: false, timestamps: true }
);

// Хук pre('save') для автоматичного встановлення username та хешування пароля
userSchema.pre('save', async function (next) {
  if (!this.username) {
    this.username = this.email;
  }

  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Метод для порівняння паролів
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Метод toJSON для автоматичного видалення пароля з відповіді сервера
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export const User = model('user', userSchema);
