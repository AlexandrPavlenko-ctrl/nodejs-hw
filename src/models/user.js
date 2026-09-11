import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    username: { type: String, required: false, trim: true },
    email: { type: String, required: [true, 'Email є обовʼязковим полем'], unique: true, trim: true, lowercase: true },
    password: { type: String, required: [true, 'Пароль є обовʼязковим полем'], minlength: [8, 'Мінімум 8 символів'] },
    avatar: {
      type: String,
      required: false,
      default: 'https://ac.goit.global/fullstack/react/default-avatar.jpg'
    }
  },
  { versionKey: false, timestamps: true }
);

// Хук pre("save") автоматично встановлює username таким самим, як email
userSchema.pre('save', async function () {
  if (!this.username) {
    this.username = this.email;
  }
});

// Налаштування toJSON для автоматичного видалення пароля
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export const User = model('User', userSchema);
