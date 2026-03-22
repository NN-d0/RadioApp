<script>
export default {
  onLaunch() {
    console.log('APP 启动成功')
  },
  onShow() {
    console.log('APP 显示')
  },
  onHide() {
    console.log('APP 隐藏')
  }
}
</script>

<style>
page {
  background: #f5f7fb;
  font-size: 28rpx;
  color: #333333;
}

view,
text,
button,
input,
textarea {
  box-sizing: border-box;
}

.container {
  min-height: 100vh;
  padding: 24rpx;
}

.card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
  margin-bottom: 24rpx;
}

.title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1f2937;
}

.sub-title {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #909399;
}

.primary-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
}

.outline-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 18rpx;
  background: #ffffff;
  color: #2563eb;
  font-size: 30rpx;
  font-weight: 600;
  border: 2rpx solid #bfdbfe;
}
</style>