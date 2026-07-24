"use client";

import React, { useState, useEffect, useRef } from "react";
import CategoriesBanner from "@/components/layout/headerBanner";
import { TranslatableText } from "@/components/translate/index.ts";

const BuildingSolutionsSection = ({ categories, tags }) => {
  const sceneRef = useRef(null);
  const containerRef = useRef(null);

  // Directly initialize Matter.js on component mount without waiting for Script loading
  useEffect(() => {
    // Only run if the ref is available
    if (!sceneRef.current) return;

    // Dynamically import Matter.js instead of using Script tag
    const loadMatterJs = async () => {
      // Check if Matter.js is already loaded globally
      if (typeof window !== "undefined" && !window.Matter) {
        try {
          // Create a script element and append it to document head
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js";
          script.async = false; // We want this to load synchronously

          // Create a promise that resolves when the script is loaded
          const loadPromise = new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });

          // Add the script to the document
          document.head.appendChild(script);

          // Wait for script to load
          await loadPromise;

          console.log("Matter.js loaded dynamically");
        } catch (error) {
          console.error("Failed to load Matter.js:", error);
          return; // Exit if loading fails
        }
      }

      // Now initialize the physics (Matter.js should be loaded by now)
      initializePhysics();
    };

    // Function to initialize the physics engine
    const initializePhysics = () => {
      if (!window.Matter) {
        console.error("Matter.js not available");
        return;
      }

      let render, engine, runner, tagContainer;

      try {
        const Matter = window.Matter;
        const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } = Matter;

        engine = Engine.create();
        engine.world.gravity.y = 0.3;

        // Setup canvas size - reduced height further
        // Batch DOM reads to avoid forced reflow
        const canvasSize = {
          width: sceneRef.current ? sceneRef.current.clientWidth : 1200,
          height: 200,
        };

        // Create renderer
        render = Render.create({
          element: sceneRef.current,
          engine: engine,
          options: {
            ...canvasSize,
            background: "transparent",
            wireframes: false,
          },
        });

        // Create boundaries
        const params = {
          isStatic: true,
          render: {
            fillStyle: "transparent",
          },
        };

        const floor = Bodies.rectangle(
          canvasSize.width / 2,
          canvasSize.height,
          canvasSize.width,
          50,
          params,
        );

        const wall1 = Bodies.rectangle(0, canvasSize.height / 2, 50, canvasSize.height, params);

        const wall2 = Bodies.rectangle(
          canvasSize.width,
          canvasSize.height / 2,
          50,
          canvasSize.height,
          params,
        );

        const top = Bodies.rectangle(canvasSize.width / 2, 0, canvasSize.width, 50, params);

        // Create tag elements
        tagContainer = document.createElement("div");
        tagContainer.className = "absolute inset-0 pointer-events-none";
        tagContainer.style.zIndex = "10";
        sceneRef.current.appendChild(tagContainer);

        // Create tag elements and physics bodies
        const wordElements = tags.map((tag) => {
          const tagElement = document.createElement("div");
          tagElement.className = `${tag.color} text-white rounded-full px-4 py-2 inline-block font-medium text-sm shadow-md whitespace-nowrap absolute pointer-events-auto cursor-grab`;
          tagElement.innerText = tag.text;
          tagContainer.appendChild(tagElement);
          return tagElement;
        });

        // Batch all DOM reads first to avoid forced reflows
        // Read all geometric properties before any writes
        const elementDimensions = wordElements.map((elemRef) => ({
          elem: elemRef,
          width: elemRef.offsetWidth || 100,
          height: elemRef.offsetHeight || 40,
        }));

        // Create physics bodies for tags with modified properties for slower movement
        const wordBodies = elementDimensions.map(({ elem: elemRef, width, height }) => {
          return {
            body: Bodies.rectangle(
              // Start all tags in the center with slight random offset
              canvasSize.width / 2 + (Math.random() * 20 - 10),
              canvasSize.height / 2 + (Math.random() * 20 - 10),
              width,
              height,
              {
                restitution: 0.3, // Reduced from 0.5 for less bounce
                friction: 0.08, // Increased from 0.05 for more drag
                frictionAir: 0.005, // Increased from 0.002 for more air resistance
                density: 0.001, // Kept light bodies
                render: {
                  fillStyle: "transparent",
                },
              },
            ),
            elem: elemRef,
            width: width,
            height: height,
            render() {
              const { x, y } = this.body.position;
              this.elem.style.top = `${y - this.height / 2}px`;
              this.elem.style.left = `${x - this.width / 2}px`;
              this.elem.style.transform = `rotate(${this.body.angle}rad)`;
            },
          };
        });

        // Improved mouse control with better drag functionality
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
          mouse: mouse,
          constraint: {
            stiffness: 0.2, // Increased stiffness for more responsive dragging
            render: {
              visible: false,
            },
          },
        });

        // Remove default mouse wheel events
        mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
        mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

        // Add all bodies to world
        World.add(engine.world, [
          floor,
          wall1,
          wall2,
          top,
          ...wordBodies.map((box) => box.body),
          mouseConstraint, // This enables dragging
        ]);

        // Set mouse for render
        render.mouse = mouse;

        // Apply gentler initial velocities to make the words move outward more slowly
        wordBodies.forEach((word) => {
          // Calculate direction vector from center
          const centerX = canvasSize.width / 2;
          const centerY = canvasSize.height / 2;
          const bodyX = word.body.position.x;
          const bodyY = word.body.position.y;

          // Normalize direction vector
          const dx = bodyX - centerX;
          const dy = bodyY - centerY;
          const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;

          // Apply velocity outward from center with even gentler force
          Matter.Body.setVelocity(word.body, {
            x: (dx / magnitude) * 1.5 + (Math.random() - 0.5) * 0.7, // Reduced from 2 and 1
            y: (dy / magnitude) * 1.5 + (Math.random() - 0.5) * 0.7, // Reduced from 2 and 1
          });
        });

        // Run the engine with slower timeScale for even slower simulation
        runner = Runner.create();
        engine.timing.timeScale = 0.9; // Slow down the whole simulation to 90% of normal speed
        Runner.run(runner, engine);
        Render.run(render);

        // Custom animation loop to make things smoother
        const animationFrame = requestAnimationFrame(function rerender() {
          // Update all word positions
          wordBodies.forEach((element) => {
            element.render();
          });

          // Request next frame
          requestAnimationFrame(rerender);
        });

        // Handle window resize to keep physics working correctly
        const handleResize = () => {
          // Batch DOM reads to avoid forced reflow
          if (!sceneRef.current) return;

          // Use requestAnimationFrame to batch resize operations
          requestAnimationFrame(() => {
            const newWidth = sceneRef.current ? sceneRef.current.clientWidth : 1200;
            render.options.width = newWidth;
            render.canvas.width = newWidth;

            // Update boundary positions
            Matter.Body.setPosition(floor, {
              x: newWidth / 2,
              y: canvasSize.height,
            });

            Matter.Body.setPosition(wall2, {
              x: newWidth,
              y: canvasSize.height / 2,
            });

            Matter.Body.setPosition(top, {
              x: newWidth / 2,
              y: 0,
            });
          });
        };

        // Add resize listener
        window.addEventListener("resize", handleResize);

        // Store references for cleanup
        if (sceneRef.current) {
          sceneRef.current.animationFrameId = animationFrame;
          sceneRef.current.matterRefs = {
            render,
            engine,
            runner,
            tagContainer,
            resizeHandler: handleResize,
          };
        }
      } catch (error) {
        console.error("Error initializing Matter.js:", error);
      }
    };

    // Start loading Matter.js
    loadMatterJs();

    // Cleanup function
    return () => {
      if (!sceneRef.current) return;

      // Clear animation frame if it exists
      if (sceneRef.current.animationFrameId) {
        cancelAnimationFrame(sceneRef.current.animationFrameId);
      }

      // Clean up Matter.js if it was initialized
      if (sceneRef.current.matterRefs) {
        const { render, engine, runner, tagContainer, resizeHandler } = sceneRef.current.matterRefs;

        // Remove resize handler
        window.removeEventListener("resize", resizeHandler);

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
  }, [tags]); // Only depend on tags

  return (
    <section className="py-8 bg-white relative overflow-hidden" ref={containerRef}>
      {/* Main heading */}
      <div className="container mx-auto px-4 mb-2">
        <h2 className="text-4xl font-bold text-center">
          <span className="text-green-800">
            <TranslatableText>Building Sustainable </TranslatableText>
          </span>
          <span className="text-primary-orange">
            <TranslatableText>Solutions With</TranslatableText>
          </span>
          <br />
          <span className="text-primary-orange">
            <TranslatableText>African Communities!</TranslatableText>
          </span>
        </h2>
      </div>

      {/* Physics engine container for floating tags */}
      <div ref={sceneRef} className="w-full relative" style={{ height: "200px" }} />
    </section>
  );
};

export default BuildingSolutionsSection;
