'use client'

import React, { useRef, useEffect } from "react";
import CategoriesBanner from "@/components/layout/headerBanner";

const BuildingSolutionsSection = ({ dict, categories, tags, onFloatingBadgeReorder }) => {
  const sceneRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    let lastOrder = tags.map(tag => tag.id);

    const loadMatterJs = async () => {
      if (typeof window !== 'undefined' && !window.Matter) {
        try {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
          script.async = false;
          const loadPromise = new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
          document.head.appendChild(script);
          await loadPromise;
        } catch (error) {
          console.error("Failed to load Matter.js:", error);
          return;
        }
      }
      initializePhysics();
    };

    const initializePhysics = () => {
      if (!window.Matter) {
        console.error("Matter.js not available");
        return;
      }
      let render, engine, runner, tagContainer;
      try {
        const Matter = window.Matter;
        const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint, Events } = Matter;
        engine = Engine.create();
        engine.world.gravity.y = 0.3;
        const canvasSize = {
          width: sceneRef.current.clientWidth,
          height: 200
        };
        render = Render.create({
          element: sceneRef.current,
          engine: engine,
          options: {
            ...canvasSize,
            background: "transparent",
            wireframes: false
          }
        });
        const params = {
          isStatic: true,
          render: { fillStyle: "transparent" }
        };
        const floor = Bodies.rectangle(canvasSize.width / 2, canvasSize.height, canvasSize.width, 50, params);
        const wall1 = Bodies.rectangle(0, canvasSize.height / 2, 50, canvasSize.height, params);
        const wall2 = Bodies.rectangle(canvasSize.width, canvasSize.height / 2, 50, canvasSize.height, params);
        const top = Bodies.rectangle(canvasSize.width / 2, 0, canvasSize.width, 50, params);
        tagContainer = document.createElement('div');
        tagContainer.className = 'absolute inset-0 pointer-events-none';
        tagContainer.style.zIndex = '10';
        sceneRef.current.appendChild(tagContainer);
        // Attach tag id to each element for tracking
        const wordElements = tags.map((tag) => {
          const tagElement = document.createElement('div');
          tagElement.className = `${tag.color} text-white rounded-full px-4 py-2 inline-block font-medium text-sm shadow-md whitespace-nowrap absolute pointer-events-auto cursor-grab`;
          tagElement.innerText = tag.text;
          tagElement.dataset.tagId = tag.id;
          tagContainer.appendChild(tagElement);
          return tagElement;
        });
        const wordBodies = wordElements.map((elemRef, i) => {
          const width = elemRef.offsetWidth;
          const height = elemRef.offsetHeight;
          return {
            id: tags[i].id,
            body: Bodies.rectangle(
              canvasSize.width / 2 + (Math.random() * 20 - 10),
              canvasSize.height / 2 + (Math.random() * 20 - 10),
              width,
              height,
              {
                restitution: 0.3,
                friction: 0.08,
                frictionAir: 0.005,
                density: 0.001,
                render: { fillStyle: "transparent" }
              }
            ),
            elem: elemRef,
            render() {
              const { x, y } = this.body.position;
              this.elem.style.top = `${y - height/2}px`;
              this.elem.style.left = `${x - width/2}px`;
              this.elem.style.transform = `rotate(${this.body.angle}rad)`;
            }
          };
        });
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
          mouse: mouse,
          constraint: {
            stiffness: 0.2,
            render: { visible: false }
          }
        });
        mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
        mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
        World.add(engine.world, [
          floor,
          wall1,
          wall2,
          top,
          ...wordBodies.map((box) => box.body),
          mouseConstraint
        ]);
        render.mouse = mouse;
        wordBodies.forEach(word => {
          const centerX = canvasSize.width / 2;
          const centerY = canvasSize.height / 2;
          const bodyX = word.body.position.x;
          const bodyY = word.body.position.y;
          const dx = bodyX - centerX;
          const dy = bodyY - centerY;
          const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;
          Matter.Body.setVelocity(word.body, {
            x: (dx / magnitude) * 1.5 + (Math.random() - 0.5) * 0.7,
            y: (dy / magnitude) * 1.5 + (Math.random() - 0.5) * 0.7
          });
        });
        runner = Runner.create();
        engine.timing.timeScale = 0.9;
        Runner.run(runner, engine);
        Render.run(render);
        const animationFrame = requestAnimationFrame(function rerender() {
          wordBodies.forEach(element => {
            element.render();
          });
          requestAnimationFrame(rerender);
        });
        // Listen for drag end and update order if changed
        Events.on(mouseConstraint, "enddrag", function() {
          // Get current x order of all tags
          const xOrder = wordBodies
            .map(wb => ({ id: wb.id, x: wb.body.position.x }))
            .sort((a, b) => a.x - b.x)
            .map(wb => wb.id);
          // Only update if order changed
          if (JSON.stringify(xOrder) !== JSON.stringify(lastOrder)) {
            lastOrder = xOrder;
            if (typeof onFloatingBadgeReorder === 'function') {
              onFloatingBadgeReorder(xOrder);
            }
          }
        });
        const handleResize = () => {
          const newWidth = sceneRef.current.clientWidth;
          render.options.width = newWidth;
          render.canvas.width = newWidth;
          Matter.Body.setPosition(floor, { x: newWidth / 2, y: canvasSize.height });
          Matter.Body.setPosition(wall2, { x: newWidth, y: canvasSize.height / 2 });
          Matter.Body.setPosition(top, { x: newWidth / 2, y: 0 });
        };
        window.addEventListener('resize', handleResize);
        if (sceneRef.current) {
          sceneRef.current.animationFrameId = animationFrame;
          sceneRef.current.matterRefs = {
            render,
            engine,
            runner,
            tagContainer,
            resizeHandler: handleResize
          };
        }
      } catch (error) {
        console.error("Error initializing Matter.js:", error);
      }
    };
    loadMatterJs();
    return () => {
      if (!sceneRef.current) return;
      if (sceneRef.current.animationFrameId) {
        cancelAnimationFrame(sceneRef.current.animationFrameId);
      }
      if (sceneRef.current.matterRefs) {
        const { render, engine, runner, tagContainer, resizeHandler } = sceneRef.current.matterRefs;
        window.removeEventListener('resize', resizeHandler);
        if (window.Matter) {
          window.Matter.Render.stop(render);
          window.Matter.Runner.stop(runner);
          if (render.canvas) {
            render.canvas.remove();
          }
          window.Matter.Engine.clear(engine);
        }
        if (tagContainer && tagContainer.parentNode) {
          tagContainer.parentNode.removeChild(tagContainer);
        }
      }
    };
  }, [tags, onFloatingBadgeReorder]);

  return (
    <section className="py-8 bg-white relative overflow-hidden" ref={containerRef}>
      {/* Main heading */}
      <div className="container mx-auto px-4 mb-2">
        <h2 className="text-4xl font-bold text-center">
          <span className="text-green-800">
            {dict?.building_solutions?.heading_1 || "Building Sustainable "}
          </span>
          <span className="text-primary-orange">
            {dict?.building_solutions?.heading_2 || "Solutions With"}
          </span>
          <br />
          <span className="text-primary-orange">
            {dict?.building_solutions?.heading_3 || "African Communities!"}
          </span>
        </h2>
      </div>

      {/* Physics engine container for floating tags (Matter.js area) */}
      <div ref={sceneRef} className="w-full relative" style={{ height: "200px" }} />
    </section>
  );
};

export default BuildingSolutionsSection;