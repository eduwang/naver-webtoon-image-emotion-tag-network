import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h3>그래프 로딩 중 오류가 발생했습니다</h3>
          <p>데이터를 다시 확인해주세요.</p>
          <button 
            className="btn btn-primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 