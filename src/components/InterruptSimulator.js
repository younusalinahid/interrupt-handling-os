import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

const InterruptHandlingSimulator = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentProcess, setCurrentProcess] = useState('Main Program');
    const [cpuState, setCpuState] = useState('Running Main Program');
    const [registers, setRegisters] = useState({ PC: 1000, SP: 2000, AX: 0, BX: 0 });
    const [interruptQueue, setInterruptQueue] = useState([]);
    const [executionLog, setExecutionLog] = useState([]);
    const [currentInstruction, setCurrentInstruction] = useState(1);
    const [isHandlingInterrupt, setIsHandlingInterrupt] = useState(false);
    const [savedContext, setSavedContext] = useState(null);
    const [totalInterrupts, setTotalInterrupts] = useState(0);
    const [handledInterrupts, setHandledInterrupts] = useState(0);

    const intervalRef = useRef(null);
    const logRef = useRef(null);

    const interruptTypes = [
        {
            id: 'timer',
            name: 'Timer Interrupt',
            icon: '⏰',
            priority: 1,
            color: 'timer',
            handler: 'Timer_Handler()'
        },
        {
            id: 'keyboard',
            name: 'Keyboard Interrupt',
            icon: '⌨️',
            priority: 2,
            color: 'keyboard',
            handler: 'Keyboard_Handler()'
        },
        {
            id: 'disk',
            name: 'Disk I/O Interrupt',
            icon: '💽',
            priority: 3,
            color: 'disk',
            handler: 'Disk_Handler()'
        },
        {
            id: 'exception',
            name: 'Exception',
            icon: '⚠️',
            priority: 0,
            color: 'exception',
            handler: 'Exception_Handler()'
        }
    ];

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setExecutionLog(prev => [...prev, { message, type, timestamp }]);
    };

    const generateInterrupt = (interruptType) => {
        const interrupt = interruptTypes.find(int => int.id === interruptType);
        if (interrupt) {
            setInterruptQueue(prev => [...prev, interrupt].sort((a, b) => a.priority - b.priority));
            setTotalInterrupts(prev => prev + 1);
            addLog(`🔔 ${interrupt.name} generated`, 'interrupt');
        }
    };

    const saveContext = () => {
        const context = { ...registers, currentInstruction, currentProcess };
        setSavedContext(context);
        addLog('💾 Context saved to stack', 'context');
        return context;
    };

    const restoreContext = () => {
        if (savedContext) {
            setRegisters(savedContext);
            setCurrentInstruction(savedContext.currentInstruction);
            setCurrentProcess(savedContext.currentProcess);
            setSavedContext(null);
            addLog('🔄 Context restored from stack', 'context');
        }
    };

    const handleInterrupt = (interrupt) => {
        if (!isHandlingInterrupt) {
            setIsHandlingInterrupt(true);
            saveContext();
            setCurrentProcess(`${interrupt.name} Handler`);
            setCpuState(`Handling ${interrupt.name}`);
            setRegisters(prev => ({ ...prev, PC: 5000 + interrupt.priority * 100 }));
            addLog(`⚡ Handling ${interrupt.name}`, 'handler');

            setTimeout(() => {
                addLog(`✅ ${interrupt.name} handled`, 'handler');
                setHandledInterrupts(prev => prev + 1);
                restoreContext();
                setCurrentProcess('Main Program');
                setCpuState('Running Main Program');
                setIsHandlingInterrupt(false);
                setInterruptQueue(prev => prev.filter(int => int.id !== interrupt.id));
            }, 2000);
        }
    };

    const simulateExecution = () => {
        if (!isHandlingInterrupt) {
            if (interruptQueue.length > 0) {
                const highestPriorityInterrupt = interruptQueue[0];
                handleInterrupt(highestPriorityInterrupt);
                return;
            }

            setCurrentInstruction(prev => prev + 1);
            setRegisters(prev => ({
                ...prev,
                PC: prev.PC + 4,
                AX: prev.AX + Math.floor(Math.random() * 10),
                BX: prev.BX + Math.floor(Math.random() * 5)
            }));

            if (currentInstruction % 5 === 0) {
                addLog(`📋 Executing instruction ${currentInstruction}`, 'execution');
            }
        }
    };

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(simulateExecution, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning, interruptQueue, isHandlingInterrupt, currentInstruction]);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [executionLog]);

    const resetSimulation = () => {
        setIsRunning(false);
        setCurrentProcess('Main Program');
        setCpuState('Idle');
        setRegisters({ PC: 1000, SP: 2000, AX: 0, BX: 0 });
        setInterruptQueue([]);
        setExecutionLog([]);
        setCurrentInstruction(1);
        setIsHandlingInterrupt(false);
        setSavedContext(null);
        setTotalInterrupts(0);
        setHandledInterrupts(0);
        clearInterval(intervalRef.current);
    };

    return (
        <div className="app-container">
            {/* Animated Background */}
            <div className="animated-background">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
            </div>

            <div className="main-content">
                {/* Header */}
                <div className="header">
                    <h1 className="header-title">
                        🖥️ Interrupt Handler
                    </h1>
                    <p className="header-subtitle">
                        Interactive OS Interrupt Handling Simulation
                    </p>
                    <div className="header-divider"></div>
                </div>

                {/* Control Panel */}
                <div className="card control-panel">
                    <h2 className="card-title">
                        <span className="title-icon">🎮</span> Control Panel
                    </h2>
                    <div className="control-buttons">
                        <button
                            onClick={() => setIsRunning(!isRunning)}
                            className={`btn-primary btn-animated ${isRunning ? 'btn-pause' : 'btn-start'}`}
                        >
                            <span className="btn-content">
                                {isRunning ? '⏸️ Pause' : '▶️ Start'} Simulation
                            </span>
                            <div className="btn-overlay"></div>
                        </button>

                        <button
                            onClick={resetSimulation}
                            className="btn-primary btn-animated btn-reset"
                        >
                            <span className="btn-content">⏹️ Reset</span>
                            <div className="btn-overlay"></div>
                        </button>
                    </div>
                </div>

                {/* CPU State and Interrupt Queue */}
                <div className="grid-container">
                    {/* CPU State */}
                    <div className="card cpu-state-card">
                        <h2 className="card-title">
                            <span className="title-icon">🖥️</span> CPU State
                        </h2>

                        <div className="cpu-info">
                            <div className="cpu-info-row modern-row">
                                <span className="cpu-info-label">Current Process:</span>
                                <span className={`process-badge modern-badge ${isHandlingInterrupt ? 'process-interrupt' : 'process-active'}`}>
                                    {currentProcess}
                                </span>
                            </div>

                            <div className="cpu-info-row modern-row">
                                <span className="cpu-info-label">CPU Status:</span>
                                <span className="cpu-status modern-status">{cpuState}</span>
                            </div>

                            <div className="cpu-info-row modern-row">
                                <span className="cpu-info-label">Instruction #:</span>
                                <span className="instruction-number modern-instruction">{currentInstruction}</span>
                            </div>
                        </div>

                        <div className="registers-section modern-registers">
                            <h3 className="registers-title">
                                <span className="registers-icon">🔢</span> CPU Registers
                            </h3>
                            <div className="registers-grid modern-registers-grid">
                                {Object.entries(registers).map(([reg, value]) => (
                                    <div key={reg} className="register-item">
                                        <div className="register-label">{reg}</div>
                                        <div className="register-value">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Interrupt Queue */}
                    <div className="card interrupt-queue-card">
                        <h2 className="card-title">
                            <span className="title-icon">📋</span> Interrupt Queue
                        </h2>

                        <div className="interrupt-queue modern-queue">
                            {interruptQueue.length === 0 ? (
                                <div className="queue-empty modern-empty">
                                    <div className="empty-icon">💤</div>
                                    <div className="empty-text">No pending interrupts</div>
                                </div>
                            ) : (
                                interruptQueue.map((interrupt, index) => (
                                    <div key={`${interrupt.id}-${index}`} className={`interrupt-item modern-interrupt-item ${interrupt.color}`}>
                                        <div className={`interrupt-icon modern-interrupt-icon ${interrupt.color}`}>
                                            {interrupt.icon}
                                        </div>
                                        <div className="interrupt-details modern-details">
                                            <div className="interrupt-name">{interrupt.name}</div>
                                            <div className="interrupt-priority">Priority: {interrupt.priority}</div>
                                        </div>
                                        <div className="interrupt-pulse"></div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Interrupt Generators */}
                <div className="card generators-card">
                    <h2 className="card-title">
                        <span className="title-icon">⚡</span> Generate Interrupts
                    </h2>
                    <div className="grid-4-cols modern-generators-grid">
                        {interruptTypes.map((interrupt) => (
                            <button
                                key={interrupt.id}
                                onClick={() => generateInterrupt(interrupt.id)}
                                disabled={!isRunning}
                                className={`interrupt-generator modern-generator ${interrupt.color}`}
                            >
                                <div className={`generator-icon modern-generator-icon ${interrupt.color}`}>
                                    {interrupt.icon}
                                </div>
                                <span className="generator-name">{interrupt.name}</span>
                                <span className="generator-priority">Priority: {interrupt.priority}</span>
                                <div className="generator-overlay"></div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Statistics */}
                <div className="card statistics-card">
                    <h2 className="card-title">
                        <span className="title-icon">📊</span> Statistics
                    </h2>
                    <div className="interrupt-stats modern-stats">
                        <div className="stat-item stat-total">
                            <div className="stat-number">{totalInterrupts}</div>
                            <div className="stat-label">Total Generated</div>
                        </div>
                        <div className="stat-item stat-pending">
                            <div className="stat-number">{interruptQueue.length}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                        <div className="stat-item stat-handled">
                            <div className="stat-number">{handledInterrupts}</div>
                            <div className="stat-label">Handled</div>
                        </div>
                    </div>
                </div>

                {/* Theory Section */}
                <div className="card theory-card">
                    <h2 className="card-title">
                        <span className="title-icon">📚</span> How Interrupt Handling Works
                    </h2>
                    <div className="theory-section modern-theory">
                        {[
                            {
                                step: "1",
                                title: "Interrupt Generation 🔔",
                                description: "Hardware devices or software generate interrupt signals when they need CPU attention.",
                                color: "step-blue"
                            },
                            {
                                step: "2",
                                title: "Context Saving 💾",
                                description: "CPU saves current state (registers, program counter) to stack before handling interrupt.",
                                color: "step-purple"
                            },
                            {
                                step: "3",
                                title: "Interrupt Handling ⚡",
                                description: "CPU jumps to appropriate interrupt handler routine based on interrupt vector table.",
                                color: "step-green"
                            },
                            {
                                step: "4",
                                title: "Handler Execution 🔄",
                                description: "Interrupt service routine processes the interrupt request and performs necessary actions.",
                                color: "step-orange"
                            },
                            {
                                step: "5",
                                title: "Context Restoration 🔄",
                                description: "CPU restores saved context from stack, returning to original program state.",
                                color: "step-teal"
                            },
                            {
                                step: "6",
                                title: "Resume Execution ▶️",
                                description: "CPU continues executing the original program from where it was interrupted.",
                                color: "step-violet"
                            }
                        ].map((item) => (
                            <div key={item.step} className={`theory-step modern-theory-step ${item.color}`}>
                                <div className="theory-step-number">
                                    {item.step}
                                </div>
                                <div className="theory-step-content">
                                    <h3 className="theory-title">{item.title}</h3>
                                    <p className="theory-description">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterruptHandlingSimulator;