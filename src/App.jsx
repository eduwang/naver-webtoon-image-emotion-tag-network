import React, { useState, useEffect } from 'react'
import './App.css'
import NetworkGraph from './components/NetworkGraph'
import ErrorBoundary from './components/ErrorBoundary'
import { loadCSVData } from './utils/dataLoader'

function App() {
  const [webtoonData, setWebtoonData] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('both'); // 'both', 'webtoon', 'emotion'
  const [isLoading, setIsLoading] = useState(true);
  const [showWebtoonClusters, setShowWebtoonClusters] = useState(false);
  const [showEmotionClusters, setShowEmotionClusters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [webtoon, emotion] = await Promise.all([
          loadCSVData('/data/webtoon_tag_jaccard_edges_Top15_weight2.csv'),
          loadCSVData('/data/image_emotion_jaccard_edges_Top15_weight55plus.csv')
        ]);
        setWebtoonData(webtoon);
        setEmotionData(emotion);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="camp-info">
            <h3 className="camp-title">2025 시흥 이공계 창의융합 진로캠프</h3>
            <p className="professor-info">유연주 교수님 팀</p>
          </div>
          <h1 className="title">네이버 웹툰 이미지 감정 태그 네트워크 분석</h1>
          <p className="subtitle">학생 탐구 보고서</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="container">
          
          {/* 서론 */}
          <section className="section">
            <h2 className="section-title">서론</h2>
            <div className="content">
              <p>
                본 연구는 네이버 웹툰의 이미지에서 감정 태그를 추출하여 
                네트워크 분석을 통해 웹툰의 감정적 특성을 탐구하는 것을 목적으로 합니다.
              </p>
              <p>
                웹툰은 현대 청소년들에게 가장 인기 있는 콘텐츠 중 하나이며, 
                각 웹툰의 이미지에서 나타나는 감정적 요소들이 독자들에게 
                어떤 영향을 미치는지 분석하는 것이 중요합니다.
              </p>
            </div>
          </section>

          {/* 연구 방법 */}
          <section className="section">
            <h2 className="section-title">연구 방법</h2>
            <div className="content">
              <h3>데이터 수집</h3>
              <ul>
                <li>네이버 웹툰 플랫폼에서 인기 웹툰 선별</li>
                <li>각 웹툰의 주요 이미지 수집</li>
                <li>이미지에서 감정 태그 추출</li>
              </ul>
              
              <h3>분석 방법</h3>
              <ul>
                <li>Sigma.js와 Graphology를 활용한 네트워크 시각화</li>
                <li>감정 태그 간의 연결 관계 분석</li>
                <li>중심성 분석을 통한 핵심 감정 요소 도출</li>
              </ul>
            </div>
          </section>

          {/* 그래프 영역 */}
          <section className="section">
            <h2 className="section-title">네트워크 그래프</h2>
            <div className="graph-container">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>데이터를 로딩 중입니다...</p>
                </div>
              ) : (
                <div className="graph-controls-container">
                  <div className="graph-toggle">
                    <button 
                      className={`btn ${selectedGraph === 'both' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedGraph('both')}
                    >
                      두 그래프 모두 보기
                    </button>
                    <button 
                      className={`btn ${selectedGraph === 'webtoon' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedGraph('webtoon')}
                    >
                      웹툰 태그 네트워크
                    </button>
                    <button 
                      className={`btn ${selectedGraph === 'emotion' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedGraph('emotion')}
                    >
                      이미지 감정 네트워크
                    </button>
                  </div>
                  
                  {/* 집단 찾기 버튼들 */}
                  <div className="cluster-controls">
                    {selectedGraph === 'both' && (
                      <>
                        <button 
                          className={`btn ${showWebtoonClusters ? 'btn-success' : 'btn-outline'}`}
                          onClick={() => setShowWebtoonClusters(!showWebtoonClusters)}
                        >
                          {showWebtoonClusters ? '웹툰 집단 숨기기' : '웹툰 집단 찾기'}
                        </button>
                        <button 
                          className={`btn ${showEmotionClusters ? 'btn-success' : 'btn-outline'}`}
                          onClick={() => setShowEmotionClusters(!showEmotionClusters)}
                        >
                          {showEmotionClusters ? '감정 집단 숨기기' : '감정 집단 찾기'}
                        </button>
                      </>
                    )}
                    {selectedGraph === 'webtoon' && (
                      <button 
                        className={`btn ${showWebtoonClusters ? 'btn-success' : 'btn-outline'}`}
                        onClick={() => setShowWebtoonClusters(!showWebtoonClusters)}
                      >
                        {showWebtoonClusters ? '집단 숨기기' : '집단 찾기'}
                      </button>
                    )}
                    {selectedGraph === 'emotion' && (
                      <button 
                        className={`btn ${showEmotionClusters ? 'btn-success' : 'btn-outline'}`}
                        onClick={() => setShowEmotionClusters(!showEmotionClusters)}
                      >
                        {showEmotionClusters ? '집단 숨기기' : '집단 찾기'}
                      </button>
                    )}
                  </div>
                  
                  <div className="graphs-display">
                    {selectedGraph === 'both' && (
                      <div className="both-graphs">
                        <ErrorBoundary>
                          <NetworkGraph 
                            data={webtoonData} 
                            title="웹툰 태그 네트워크 (Jaccard 유사도)"
                            height={400}
                            showClusters={showWebtoonClusters}
                            onClustersFound={(clusters) => console.log('웹툰 집단:', clusters)}
                          />
                        </ErrorBoundary>
                        <ErrorBoundary>
                          <NetworkGraph 
                            data={emotionData} 
                            title="이미지 감정 네트워크 (Jaccard 유사도)"
                            height={400}
                            showClusters={showEmotionClusters}
                            onClustersFound={(clusters) => console.log('감정 집단:', clusters)}
                          />
                        </ErrorBoundary>
                      </div>
                    )}
                    {selectedGraph === 'webtoon' && (
                      <ErrorBoundary>
                        <NetworkGraph 
                          data={webtoonData} 
                          title="웹툰 태그 네트워크 (Jaccard 유사도)"
                          height={600}
                          showClusters={showWebtoonClusters}
                          onClustersFound={(clusters) => console.log('웹툰 집단:', clusters)}
                        />
                      </ErrorBoundary>
                    )}
                    {selectedGraph === 'emotion' && (
                      <ErrorBoundary>
                        <NetworkGraph 
                          data={emotionData} 
                          title="이미지 감정 네트워크 (Jaccard 유사도)"
                          height={600}
                          showClusters={showEmotionClusters}
                          onClustersFound={(clusters) => console.log('감정 집단:', clusters)}
                        />
                      </ErrorBoundary>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 연구 결과 */}
          <section className="section">
            <h2 className="section-title">연구 결과</h2>
            <div className="content">
              <h3>주요 발견사항</h3>
              <ul>
                <li>웹툰에서 가장 빈번하게 나타나는 감정 태그</li>
                <li>감정 태그 간의 연결 패턴</li>
                <li>장르별 감정적 특성의 차이</li>
              </ul>
              
              <h3>통계적 분석</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{webtoonData.length}</span>
                  <span className="stat-label">웹툰 태그 연결 수</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{emotionData.length}</span>
                  <span className="stat-label">이미지 감정 연결 수</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {new Set([...webtoonData.map(d => d.Source1), ...webtoonData.map(d => d.Source2)]).size}
                  </span>
                  <span className="stat-label">웹툰 태그 노드 수</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {new Set([...emotionData.map(d => d.Source1), ...emotionData.map(d => d.Source2)]).size}
                  </span>
                  <span className="stat-label">이미지 감정 노드 수</span>
                </div>
              </div>
            </div>
          </section>

          {/* 결론 */}
          <section className="section">
            <h2 className="section-title">결론</h2>
            <div className="content">
              <p>
                본 연구를 통해 네이버 웹툰의 이미지에서 나타나는 감정적 특성을 
                네트워크 분석으로 시각화하고 분석할 수 있었습니다.
              </p>
              <p>
                향후 연구에서는 더 많은 웹툰 데이터를 수집하여 
                더 정확한 패턴 분석을 진행할 예정입니다.
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="researcher-info">
              <h3>연구자 정보</h3>
              <p><strong>연구 주제:</strong> 네이버 웹툰 이미지 감정 태그 네트워크 분석</p>
              <p><strong>연구 기간:</strong> 2024년</p>
              <p><strong>연구 방법:</strong> 네트워크 분석, 시각화</p>
              <p><strong>캠프:</strong> 2025 시흥 이공계 창의융합 진로캠프</p>
              <p><strong>지도교수:</strong> 유연주 교수님</p>
            </div>
            <div className="footer-links">
              <p>&copy; 2024 학생 탐구 보고서</p>
              <p>네이버 웹툰 이미지 감정 분석 프로젝트</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
